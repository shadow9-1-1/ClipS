const { likeVideo, unlikeVideo } = require('../services/likeService');

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

module.exports = {
  like,
  unlike,
};
