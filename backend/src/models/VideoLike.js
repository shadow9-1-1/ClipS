const mongoose = require('mongoose');

const videoLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

videoLikeSchema.index({ user: 1, video: 1 }, { unique: true });

const VideoLike = mongoose.model('VideoLike', videoLikeSchema);

module.exports = VideoLike;
