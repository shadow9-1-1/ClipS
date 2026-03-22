const User = require('../models/User');

const mapUserResponse = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role,
  bio: user.bio,
  avatarKey: user.avatarKey,
  active: user.active,
  accountStatus: user.accountStatus,
  notificationPreferences: user.notificationPreferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getCurrentUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -__v');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return mapUserResponse(user);
};

const updateCurrentUserProfile = async (userId, payload) => {
  const updates = {};

  if (typeof payload.username !== 'undefined') {
    const username = payload.username.toLowerCase();

    const existingUsername = await User.findOne({
      _id: { $ne: userId },
      username,
    }).lean();

    if (existingUsername) {
      const err = new Error('Username already exists');
      err.statusCode = 409;
      throw err;
    }

    updates.username = username;
  }

  if (typeof payload.bio !== 'undefined') {
    updates.bio = payload.bio;
  }

  if (typeof payload.avatarKey !== 'undefined') {
    updates.avatarKey = payload.avatarKey;
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
    context: 'query',
  }).select('-password -__v');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return mapUserResponse(user);
};

const getPublicUserProfile = async (userId) => {
  const user = await User.findById(userId).select('username bio avatarKey active accountStatus createdAt');

  if (!user || !user.active || user.accountStatus !== 'active') {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    bio: user.bio,
    avatarKey: user.avatarKey,
    createdAt: user.createdAt,
  };
};

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getPublicUserProfile,
};
