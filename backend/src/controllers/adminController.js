const { getAdminHealthStatus } = require('../services/healthService');
const {
    getAdminStats,
    updateUserStatus,
    getModerationQueue,
} = require('../services/adminService');

const getAdminOverview = async(req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            message: 'Admin route access granted',
            user: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
            },
        },
    });
};

const getAdminHealth = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: getAdminHealthStatus(),
    });
};

/**
 * Get admin statistics
 * Returns: totalUsers, totalVideos, mostActiveUsers (top 5)
 */
const getStats = async(req, res) => {
    const stats = await getAdminStats();

    res.status(200).json({
        status: 'success',
        data: stats,
    });
};

/**
 * Update user status (soft delete)
 * PATCH /api/v1/admin/users/:id/status
 * Body: { active: boolean }
 */
const updateUserAccountStatus = async(req, res) => {
    const { id } = req.params;
    const result = await updateUserStatus(id, req.body);

    res.status(200).json({
        status: 'success',
        data: result,
    });
};

/**
 * Get moderation queue
 * Returns: flagged videos and low-rated videos
 */
const getModerationItems = async(req, res) => {
    const queue = await getModerationQueue();

    res.status(200).json({
        status: 'success',
        data: queue,
    });
};

module.exports = {
    getAdminOverview,
    getAdminHealth,
    getStats,
    updateUserAccountStatus,
    getModerationItems,
};