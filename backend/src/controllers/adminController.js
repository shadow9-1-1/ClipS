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

module.exports = {
  getAdminOverview,
};
