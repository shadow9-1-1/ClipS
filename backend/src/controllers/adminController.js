const { getAdminHealthStatus } = require('../services/healthService');

const getAdminOverview = async (req, res) => {
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

module.exports = {
  getAdminOverview,
  getAdminHealth,
};
