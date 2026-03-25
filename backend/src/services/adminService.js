const mongoose = require('mongoose');
const User = require('../models/User');
const Video = require('../models/Video');
const Review = require('../models/Review');

/**
 * Get admin statistics including total users, total videos, and most active users
 * Uses MongoDB aggregation pipelines for efficient data retrieval
 */
const getAdminStats = async() => {
    try {
        // Get total users count
        const totalUsers = await User.countDocuments();

        // Get total videos count
        const totalVideos = await Video.countDocuments();

        // Get most active users using aggregation pipeline
        const mostActiveUsers = await Video.aggregate([{
                $group: {
                    _id: '$owner',
                    videoCount: { $sum: 1 },
                },
            },
            {
                $sort: { videoCount: -1 },
            },
            {
                $limit: 5,
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 0,
                    userId: '$user._id',
                    username: '$user.username',
                    email: '$user.email',
                    videoCount: 1,
                },
            },
        ]);

        return {
            totalUsers,
            totalVideos,
            mostActiveUsers,
        };
    } catch (error) {
        const err = new Error('Failed to fetch admin statistics');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Update user status (soft delete by setting active field)
 * @param {string} userId - User ID to update
 * @param {object} payload - Payload containing status object with active boolean
 */
const updateUserStatus = async(userId, payload) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const err = new Error('Invalid user ID format');
            err.statusCode = 400;
            throw err;
        }

        // Validate payload
        if (typeof payload.active !== 'boolean') {
            const err = new Error('Status must be a boolean value');
            err.statusCode = 400;
            throw err;
        }

        // Update user status atomically
        const user = await User.findByIdAndUpdate(
            userId, { active: payload.active }, { new: true }
        );

        if (!user) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }

        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            active: user.active,
            message: `User status updated to ${payload.active ? 'active' : 'inactive'}`,
        };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        const err = new Error('Failed to update user status');
        err.statusCode = 500;
        throw err;
    }
};

/**
 * Get moderation queue - videos that need review
 * Returns: flagged videos with owner info
 */
const getModerationQueue = async() => {
    try {
        // Get flagged videos with owner info populated
        const videos = await Video.find({ status: 'flagged' })
            .populate('owner', 'username email')
            .sort({ createdAt: -1 })
            .lean();

        // Transform the data
        const items = videos.map((video) => ({
            _id: video._id,
            title: video.title,
            description: video.description,
            duration: video.duration,
            viewsCount: video.viewsCount,
            status: video.status,
            createdAt: video.createdAt,
            owner: {
                id: video.owner._id,
                username: video.owner.username,
                email: video.owner.email,
            },
            reason: 'flagged',
        }));

        return {
            totalItems: items.length,
            items,
        };
    } catch (error) {
        const err = new Error('Failed to fetch moderation queue');
        err.statusCode = 500;
        throw err;
    }
};

module.exports = {
    getAdminStats,
    updateUserStatus,
    getModerationQueue,
};