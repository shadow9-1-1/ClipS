const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
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

// Enforces one review per user per video at database level.
reviewSchema.index({ user: 1, video: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
