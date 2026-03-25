const { getHealthStatus } = require('../services/healthService');

const getHealth = (req, res) => {
  res.status(200).json(getHealthStatus());
};

module.exports = { getHealth };
