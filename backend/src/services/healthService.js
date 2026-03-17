const getHealthStatus = () => {
  return {
    status: 'Ok',
    // uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};

module.exports = { getHealthStatus };
