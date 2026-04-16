const { likeVideo, unlikeVideo, getVideoEngagement } = require('../services/likeService');

const like = async (req, res) => {
  const likeEntry = await likeVideo({
    videoId: req.params.id,
    userId: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Video liked successfully',
    data: {
      like: likeEntry,
    },
  });
};

const unlike = async (req, res) => {
  await unlikeVideo({
    videoId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Video unliked successfully',
  });
};

const getEngagement = async (req, res) => {
  const userId = req.user?._id;
  const engagement = await getVideoEngagement(req.params.id, userId);

  res.status(200).json({
    status: 'success',
    data: engagement,
  });
};

module.exports = {
  like,
  unlike,
  getEngagement,
};
