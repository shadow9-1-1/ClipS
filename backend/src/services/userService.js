const User = require('../models/User');

const defaultNotificationChannel = {
  followers: true,
  newVideos: true,
  comments: true,
  likes: true,
  tips: true,
};

const normalizeNotificationChannel = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...defaultNotificationChannel };
  }

  return {
    followers: typeof value.followers === 'boolean' ? value.followers : true,
    newVideos: typeof value.newVideos === 'boolean' ? value.newVideos : true,
    comments: typeof value.comments === 'boolean' ? value.comments : true,
    likes: typeof value.likes === 'boolean' ? value.likes : true,
    tips: typeof value.tips === 'boolean' ? value.tips : true,
  };
};

const normalizeNotificationPreferences = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      inApp: { ...defaultNotificationChannel },
      email: { ...defaultNotificationChannel },
    };
  }

  return {
    inApp: normalizeNotificationChannel(value.inApp),
    email: normalizeNotificationChannel(value.email),
  };
};

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

const updateUserPreferences = async (userId, updates) => {
  const user = await User.findById(userId).select('notificationPreferences');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const normalized = normalizeNotificationPreferences(user.notificationPreferences);

  for (const channel of ['inApp', 'email']) {
    if (updates[channel] && typeof updates[channel] === 'object') {
      normalized[channel] = {
        ...normalized[channel],
        ...updates[channel],
      };
    }
  }

  user.notificationPreferences = normalized;
  await user.save();

  return user.notificationPreferences;
};

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getPublicUserProfile,
  updateUserPreferences,
};
