const mongoose = require('mongoose');

const videoSaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
  },
  { timestamps: true }
);

videoSaveSchema.index({ user: 1, video: 1 }, { unique: true });
videoSaveSchema.index({ user: 1, createdAt: -1 });

const VideoSave = mongoose.model('VideoSave', videoSaveSchema);

module.exports = VideoSave;
