const {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getPublicUserProfile,
  updateUserPreferences,
} = require('../services/userService');

const getMe = async (req, res) => {
  const user = await getCurrentUserProfile(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

const updateMe = async (req, res) => {
  const user = await updateCurrentUserProfile(req.user._id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user },
  });
};

const getUserProfile = async (req, res) => {
  const profile = await getPublicUserProfile(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { user: profile },
  });
};

const updatePreferences = async (req, res) => {
  const preferences = await updateUserPreferences(req.user._id, req.body);

  res.status(200).json({
    status: 'success',
    data: { preferences },
  });
};

module.exports = {
  getMe,
  updateMe,
  getUserProfile,
  updatePreferences,
};
