const { getHealthStatus } = require('../services/healthService');

const getHealth = async (req, res) => {
  const status = getHealthStatus();
  res.status(200).json(status);
};

module.exports = { getHealth };
