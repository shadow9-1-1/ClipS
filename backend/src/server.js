const dotenv = require('dotenv');

dotenv.config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { createSocketServer } = require('./sockets');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err);
});

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    createSocketServer(server);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
      console.log(`Health check at http://localhost:${PORT}/api/v1/health`);
      // console.log(`Auth register at http://localhost:${PORT}/api/v1/auth/register`);
      // console.log(`Auth login at http://localhost:${PORT}/api/v1/auth/login`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

startServer();
