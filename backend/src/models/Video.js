const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    videoURL: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
      match: [/^https?:\/\/\S+$/i, 'Please provide a valid video URL'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [0, 'Duration cannot be negative'],
      max: [300, 'Duration must be less than or equal to 300 seconds'],
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: [0, 'Views count cannot be negative'],
    },
    status: {
      type: String,
      enum: ['public', 'private', 'flagged'],
      default: 'public',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.index({ owner: 1, createdAt: -1 });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
