const { getLikedVideoIdsByUser } = require('../services/likeService');
const { getSavedVideoIdsByUser } = require('../services/saveService');

const getMyLikedVideos = async (req, res) => {
  const likedVideoIds = await getLikedVideoIdsByUser(req.user._id);
  res.status(200).json({
    status: 'success',
    data: { videoIds: likedVideoIds },
  });
};

const getMySavedVideos = async (req, res) => {
  const savedVideoIds = await getSavedVideoIdsByUser(req.user._id);
  res.status(200).json({
    status: 'success',
    data: { videoIds: savedVideoIds },
  });
};

module.exports = {
  getMyLikedVideos,
  getMySavedVideos,
};
