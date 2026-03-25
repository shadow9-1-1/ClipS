const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    videoURL: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      max: [300, 'Duration cannot exceed 300 seconds'],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['public', 'private', 'flagged'],
      default: 'public',
    },
  },
  { timestamps: true }
);

videoSchema.index({ owner: 1 });
videoSchema.index({ status: 1, createdAt: -1 });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
