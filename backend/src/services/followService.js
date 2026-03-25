const mongoose = require('mongoose');
const Follow = require('../models/Follow');
const User = require('../models/User');

const assertUserExists = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('Invalid user ID');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId).select('_id active accountStatus').lean();

  if (!user || !user.active || user.accountStatus !== 'active') {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
};

const followUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    const err = new Error('You cannot follow yourself');
    err.statusCode = 403;
    throw err;
  }

  await assertUserExists(followingId);

  try {
    await Follow.create({ followerId, followingId });
  } catch (err) {
    if (err.code === 11000) {
      const duplicate = new Error('You are already following this user');
      duplicate.statusCode = 409;
      throw duplicate;
    }
    throw err;
  }
};

const unfollowUser = async (followerId, followingId) => {
  await Follow.findOneAndDelete({ followerId, followingId });
};

const getFollowers = async (userId) => {
  await assertUserExists(userId);

  const follows = await Follow.find({ followingId: userId })
    .populate('followerId', 'username email')
    .lean();

  return follows.map((f) => ({
    id: f.followerId._id.toString(),
    username: f.followerId.username,
    email: f.followerId.email,
    followedAt: f.createdAt,
  }));
};

const getFollowing = async (userId) => {
  await assertUserExists(userId);

  const follows = await Follow.find({ followerId: userId })
    .populate('followingId', 'username email')
    .lean();

  return follows.map((f) => ({
    id: f.followingId._id.toString(),
    username: f.followingId.username,
    email: f.followingId.email,
    followedAt: f.createdAt,
  }));
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
