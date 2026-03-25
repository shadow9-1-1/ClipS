const { createVideo } = require('../services/videoService');

const createVideoHandler = async (req, res) => {
  const video = await createVideo({
    ownerId: req.user._id,
    title: req.body.title,
    description: req.body.description,
    videoURL: req.body.videoURL,
    duration: req.body.duration,
    status: req.body.status,
  });

  res.status(201).json({
    status: 'success',
    message: 'Video created successfully',
    data: {
      video,
    },
  });
};

module.exports = {
  createVideoHandler,
};
