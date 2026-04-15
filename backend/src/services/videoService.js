const mongoose = require('mongoose');
const Video = require('../models/Video');
const Follow = require('../models/Follow');
const Review = require('../models/Review');
const VideoLike = require('../models/VideoLike');
const { sendNewVideoFromFollowedUserNotification } = require('./notificationService');

const reviewCollection = Review.collection.name;
const videoLikeCollection = VideoLike.collection.name;
const userCollection = 'users';

const buildFeedProjectionPipeline = ({ matchStage, recentSince }) => [
  { $match: matchStage },
  {
    $lookup: {
      from: reviewCollection,
      localField: '_id',
      foreignField: 'video',
      as: 'reviews',
    },
  },
  {
    $lookup: {
      from: reviewCollection,
      let: { videoId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ['$video', '$$videoId'] }, { $gte: ['$createdAt', recentSince] }],
            },
          },
        },
      ],
      as: 'recentReviews',
    },
  },
  {
    $lookup: {
      from: videoLikeCollection,
      let: { videoId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ['$video', '$$videoId'] }, { $gte: ['$createdAt', recentSince] }],
            },
          },
        },
      ],
      as: 'recentLikes',
    },
  },
  {
    $lookup: {
      from: userCollection,
      localField: 'owner',
      foreignField: '_id',
      as: 'ownerInfo',
    },
  },
  {
    $unwind: '$ownerInfo',
  },
  {
    $addFields: {
      averageRating: {
        $ifNull: [{ $round: [{ $avg: '$reviews.rating' }, 2] }, 0],
      },
      reviewCount: { $size: '$reviews' },
      recentEngagement: {
        $add: [{ $size: '$recentReviews' }, { $size: '$recentLikes' }],
      },
    },
  },
  {
    $project: {
      title: 1,
      description: 1,
      videoURL: 1,
      duration: 1,
      viewsCount: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
      averageRating: 1,
      reviewCount: 1,
      recentEngagement: 1,
      owner: {
        _id: '$ownerInfo._id',
        username: '$ownerInfo.username',
        avatarKey: '$ownerInfo.avatarKey',
      },
    },
  },
];

const createVideo = async (ownerId, payload) => {
  const video = await Video.create({
    title: payload.title,
    description: payload.description,
    videoURL: payload.videoURL,
    duration: payload.duration,
    status: payload.status,
    owner: ownerId,
  });

  if (video.status === 'public') {
    await sendNewVideoFromFollowedUserNotification({
      creatorId: ownerId,
      videoTitle: video.title,
    });
  }

  return video;
};

const getVideos = async ({ limit, skip }) => {
  const videos = await Video.find({ status: 'public' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('owner', 'username avatarKey')
    .lean();

  const total = await Video.countDocuments({ status: 'public' });

  return { videos, total };
};

const getFollowingFeed = async ({ viewerId, limit, skip }) => {
  const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const followerObjectId = new mongoose.Types.ObjectId(viewerId);

  const followedRows = await Follow.aggregate([
    { $match: { followerId: followerObjectId } },
    { $group: { _id: null, followedIds: { $addToSet: '$followingId' } } },
  ]);

  const followedIds = followedRows[0]?.followedIds || [];

  if (followedIds.length === 0) {
    return { videos: [], total: 0 };
  }

  const [videos, totalResult] = await Promise.all([
    Video.aggregate([
      ...buildFeedProjectionPipeline({
        matchStage: { status: 'public', owner: { $in: followedIds } },
        recentSince,
      }),
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]),
    Video.aggregate([
      { $match: { status: 'public', owner: { $in: followedIds } } },
      { $count: 'total' },
    ]),
  ]);

  return { videos, total: totalResult[0]?.total || 0 };
};

const getTrendingFeed = async ({ limit, skip }) => {
  const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [videos, totalResult] = await Promise.all([
    Video.aggregate([
      ...buildFeedProjectionPipeline({
        matchStage: { status: 'public' },
        recentSince,
      }),
      {
        $sort: {
          averageRating: -1,
          recentEngagement: -1,
          createdAt: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]),
    Video.aggregate([{ $match: { status: 'public' } }, { $count: 'total' }]),
  ]);

  return { videos, total: totalResult[0]?.total || 0 };
};

const updateVideo = async (videoId, requesterId, payload) => {
  const video = await Video.findById(videoId);

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  if (video.owner.toString() !== requesterId.toString()) {
    const err = new Error('You are not allowed to update this video');
    err.statusCode = 403;
    throw err;
  }

  if (typeof payload.title !== 'undefined') video.title = payload.title;
  if (typeof payload.description !== 'undefined') video.description = payload.description;

  await video.save();

  return video;
};

const deleteVideo = async (videoId, requesterId, requesterRole) => {
  const video = await Video.findById(videoId);

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = video.owner.toString() === requesterId.toString();
  const isAdmin = requesterRole === 'admin';

  if (!isOwner && !isAdmin) {
    const err = new Error('You are not allowed to delete this video');
    err.statusCode = 403;
    throw err;
  }

  await video.deleteOne();
};

module.exports = {
  createVideo,
  getVideos,
  getFollowingFeed,
  getTrendingFeed,
  updateVideo,
  deleteVideo,
};
