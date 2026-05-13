const mongoose = require('mongoose');
const Video = require('../models/Video');
const Follow = require('../models/Follow');
const Review = require('../models/Review');
const VideoLike = require('../models/VideoLike');
const { sendNewVideoFromFollowedUserNotification } = require('./notificationService');
const { uploadVideoObject, deleteObject, generateTemporaryAccessUrl } = require('./storageService');
const { validateVideoDuration } = require('./videoValidationService');
const { addVideoMetadataJob } = require('../queues');
const { getRedisClient } = require('../config/redis');

const reviewCollection = Review.collection.name;
const videoLikeCollection = VideoLike.collection.name;
const userCollection = 'users';

const invalidateTrendingCache = async () => {
  try {
    const client = getRedisClient();
    if (!client) return;
    const keys = await client.keys('feed:trending:*');
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    console.error('Failed to invalidate trending cache:', err.message);
  }
};

const calculateTrendingScore = async (videoId) => {
  try {
    // Get likes count
    const likesCount = await VideoLike.countDocuments({ video: videoId });

    // Get average rating
    const ratingStats = await Review.aggregate([
      { $match: { video: videoId } },
      {
        $group: {
          _id: '$video',
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const avgRating = ratingStats[0]?.avgRating || 0;

    // Get video to calculate freshness bonus
    const video = await Video.findById(videoId).select('createdAt').lean();
    if (!video) {
      return 0;
    }

    // Calculate freshness bonus (7-day window)
    const FRESHNESS_WINDOW_DAYS = 7;
    const FRESHNESS_BONUS_MULTIPLIER = 5;
    const ageInDays = (Date.now() - new Date(video.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const freshnessBonus = Math.max(
      0,
      (FRESHNESS_WINDOW_DAYS - ageInDays) * FRESHNESS_BONUS_MULTIPLIER
    );

    // Calculate total score: (Likes × 10) + (Avg_Rating × 2) + Freshness_Bonus
    const trendingScore = (likesCount * 10) + (avgRating * 2) + freshnessBonus;

    return Math.max(0, trendingScore);
  } catch (error) {
    console.error('Error calculating trending score:', error.message);
    return 0;
  }
};

/**
 * Update trending score for a video in the database
 */
const updateTrendingScore = async (videoId) => {
  try {
    const score = await calculateTrendingScore(videoId);
    await Video.findByIdAndUpdate(videoId, { trendingScore: score });
    await invalidateTrendingCache();
    return score;
  } catch (error) {
    console.error('Error updating trending score:', error.message);
  }
};

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
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [{ $eq: ['$video', '$$videoId'] }, { $gte: ['$createdAt', recentSince] }],
                    },
                },
            }, ],
            as: 'recentReviews',
        },
    },
    {
        $lookup: {
            from: videoLikeCollection,
            let: { videoId: '$_id' },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [{ $eq: ['$video', '$$videoId'] }, { $gte: ['$createdAt', recentSince] }],
                    },
                },
            }, ],
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
            videoObjectKey: 1,
            videoBucket: 1,
            duration: 1,
            viewsCount: 1,
            status: 1,
            trendingScore: 1,
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

const attachVideoAccessUrl = (video) => {
    if (!video) {
        return video;
    }

    const existingUrl = typeof video.videoURL === 'string' ? video.videoURL.trim() : '';
    if (existingUrl) {
        return video;
    }

    if (!video.videoObjectKey) {
        return video;
    }

    const bucket = video.videoBucket || process.env.S3_VIDEO_BUCKET || process.env.S3_BUCKET;
    const access = generateTemporaryAccessUrl({ key: video.videoObjectKey, bucket });
    return {
        ...video,
        videoURL: access.accessUrl,
        videoAccessExpiresAt: access.expiresAt,
        videoAccessExpiresIn: access.expiresIn,
    };
};

const createVideo = async(ownerId, payload) => {
    const video = await Video.create({
        title: payload.title,
        description: payload.description,
        videoURL: payload.videoURL,
        videoObjectKey: payload.videoObjectKey,
        videoBucket: payload.videoBucket,
        duration: payload.duration,
        status: payload.status,
        owner: ownerId,
        trendingScore: 0, // Initialize with 0
    });

    if (video.status === 'public') {
        await sendNewVideoFromFollowedUserNotification({
            creatorId: ownerId,
            videoTitle: video.title,
        });
        await invalidateTrendingCache();
    }

    return video;
};

const getVideos = async({ limit, skip }) => {
    const videos = await Video.find({ status: 'public' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'username avatarKey')
        .lean();

    const total = await Video.countDocuments({ status: 'public' });
    return { videos: videos.map(attachVideoAccessUrl), total };
};

const getFollowingFeed = async({ viewerId, limit, skip }) => {
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

    return { videos: videos.map(attachVideoAccessUrl), total: totalResult[0]?.total || 0 };
};

const getTrendingFeed = async({ limit, skip }) => {
    const cacheKey = `feed:trending:limit:${limit}:skip:${skip}`;
    const client = getRedisClient();
    
    if (client) {
        try {
            const cachedData = await client.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        } catch (err) {
            console.error('Redis get error:', err.message);
        }
    }

    const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [videos, totalResult] = await Promise.all([
        Video.aggregate([
            ...buildFeedProjectionPipeline({
                matchStage: { status: 'public' },
                recentSince,
            }),
            {
                $sort: {
                    trendingScore: -1,
                    createdAt: -1,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]),
        Video.aggregate([{ $match: { status: 'public' } }, { $count: 'total' }]),
    ]);

    const result = { videos: videos.map(attachVideoAccessUrl), total: totalResult[0]?.total || 0 };

    if (client) {
        try {
            await client.setEx(cacheKey, 600, JSON.stringify(result));
        } catch (err) {
            console.error('Redis setEx error:', err.message);
        }
    }

    return result;
};

const getPersonalizedFeed = async({ viewerId, limit, skip }) => {
    const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const followerObjectId = new mongoose.Types.ObjectId(viewerId);

    // Get followed user IDs
    const followedRows = await Follow.aggregate([
        { $match: { followerId: followerObjectId } },
        { $group: { _id: null, followedIds: { $addToSet: '$followingId' } } },
    ]);

    const followedIds = followedRows[0]?.followedIds || [];

    // Fetch videos from followed users (prioritized)
    let followingVideos = [];
    let followingTotal = 0;
    
    if (followedIds.length > 0) {
        const [following, followingCountResult] = await Promise.all([
            Video.aggregate([
                ...buildFeedProjectionPipeline({
                    matchStage: { status: 'public', owner: { $in: followedIds } },
                    recentSince,
                }),
                {
                    $sort: {
                        trendingScore: -1,
                        createdAt: -1,
                    },
                },
            ]),
            Video.aggregate([
                { $match: { status: 'public', owner: { $in: followedIds } } },
                { $count: 'total' },
            ]),
        ]);
        
        followingVideos = following;
        followingTotal = followingCountResult[0]?.total || 0;
    }

    // Determine if we need trending videos to fill the remaining slots
    const remainingSlots = Math.max(0, limit - followingVideos.length);
    let trendingVideos = [];
    let trendingTotal = 0;

    if (remainingSlots > 0) {
        // Get trending videos (excluding followed users)
        const [trending, trendingCountResult] = await Promise.all([
            Video.aggregate([
                ...buildFeedProjectionPipeline({
                    matchStage: { 
                        status: 'public', 
                        owner: { $nin: followedIds } 
                    },
                    recentSince,
                }),
                {
                    $sort: {
                        trendingScore: -1,
                        createdAt: -1,
                    },
                },
                { $skip: skip },
                { $limit: remainingSlots },
            ]),
            Video.aggregate([
                { $match: { status: 'public', owner: { $nin: followedIds } } },
                { $count: 'total' },
            ]),
        ]);
        
        trendingVideos = trending;
        trendingTotal = trendingCountResult[0]?.total || 0;
    }

    // Combine: followed users first, then trending
    const combinedVideos = [
        ...followingVideos.slice(skip, skip + limit),
        ...trendingVideos,
    ].slice(0, limit);

    // Total is sum of both, but respects pagination
    const total = followingTotal + trendingTotal;

    return { 
        videos: combinedVideos.map(attachVideoAccessUrl), 
        total,
        breakdown: {
            followingCount: followingVideos.length,
            trendingCount: trendingVideos.length,
        },
    };
};

const uploadVideoFile = async({ ownerId, file, payload = {} }) => {
    const { duration } = await validateVideoDuration(file);

    const uploaded = await uploadVideoObject({
        file,
        ownerId,
        duration,
    });

    let video;

    try {
        const title =
            typeof payload.title === 'string' && payload.title.trim() ?
            payload.title.trim() :
            file.originalname.replace(/\.[^/.]+$/, '');
        const description =
            typeof payload.description === 'string' ? payload.description.trim() : '';

        video = await Video.create({
            title,
            description,
            videoURL: '',
            videoObjectKey: uploaded.key,
            videoBucket: uploaded.bucket,
            duration,
            status: 'public',
            owner: ownerId,
            trendingScore: 0, // Initialize with 0
        });
    } catch (dbErr) {
        try {
            await deleteObject({
                bucket: uploaded.bucket,
                key: uploaded.key,
            });
        } catch (cleanupErr) {
            console.error('Failed to cleanup object after DB write failure:', cleanupErr.message);
        }

        throw dbErr;
    }

    if (video.status === 'public') {
        try {
            await sendNewVideoFromFollowedUserNotification({
                creatorId: ownerId,
                videoTitle: video.title,
            });
        } catch (notificationErr) {
            console.error('Failed to send new video notification:', notificationErr.message);
        }
    }

    if (video) {
        try {
            await addVideoMetadataJob({ videoId: video._id.toString(), fileKey: uploaded.key });
        } catch (jobErr) {
            console.error('Failed to add video metadata job:', jobErr.message);
        }
    }

    return {
        file: uploaded,
        video,
    };
};

const updateVideo = async(videoId, requesterId, payload) => {
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
    await invalidateTrendingCache();

    return video;
};

const getPublicVideoById = async(videoId) => {
    const video = await Video.findOne({
            _id: videoId,
            status: 'public',
        })
        .populate('owner', 'username')
        .lean();

    if (!video) {
        return null;
    }

    return attachVideoAccessUrl({
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        videoURL: video.videoURL,
        videoObjectKey: video.videoObjectKey,
        videoBucket: video.videoBucket,
        duration: video.duration,
        viewsCount: video.viewsCount,
        owner: {
            id: video.owner?._id?.toString(),
            username: video.owner?.username || '',
        },
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
    });
};

const deleteVideo = async(videoId, requesterId, requesterRole) => {
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
    await invalidateTrendingCache();
};

module.exports = {
    createVideo,
    getVideos,
    getPublicVideoById,
    getFollowingFeed,
    getTrendingFeed,
    getPersonalizedFeed,
    uploadVideoFile,
    updateVideo,
    deleteVideo,
    calculateTrendingScore,
    updateTrendingScore,
};