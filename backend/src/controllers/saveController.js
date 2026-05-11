const { saveVideo, unsaveVideo } = require('../services/saveService');

const save = async (req, res) => {
  const saveEntry = await saveVideo({
    videoId: req.params.id,
    userId: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Video saved successfully',
    data: {
      save: saveEntry,
    },
  });
};

const unsave = async (req, res) => {
  await unsaveVideo({
    videoId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Video unsaved successfully',
  });
};

module.exports = {
  save,
  unsave,
};
