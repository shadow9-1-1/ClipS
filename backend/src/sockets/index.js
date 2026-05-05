const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const defaultDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const getAllowedOrigins = () => {
  const extraOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...defaultDevOrigins, ...extraOrigins];
};

const buildCorsOptions = () => ({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    const allowed = getAllowedOrigins();
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});

const resolveSocketToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim();
  }

  const authHeader = socket.handshake?.headers?.authorization || '';
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const queryToken = socket.handshake?.query?.token;
  if (typeof queryToken === 'string' && queryToken.trim()) {
    return queryToken.trim();
  }

  return null;
};

const authenticateSocket = async (socket) => {
  const token = resolveSocketToken(socket);
  if (!token) {
    throw new Error('Authorization token missing');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret is not configured');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (verifyError) {
    throw new Error('Invalid or expired token');
  }

  const userId = decoded.sub || decoded.id || decoded._id;
  if (!userId) {
    throw new Error('User not authorized');
  }

  const user = await User.findById(userId).select('-password');
  if (!user || !user.active || user.accountStatus !== 'active') {
    throw new Error('User not authorized');
  }

  socket.data.user = user;
};

const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: buildCorsOptions(),
  });

  io.use((socket, next) => {
    authenticateSocket(socket)
      .then(() => next())
      .catch((err) => next(err));
  });

  io.on('connection', (socket) => {
    const userId = socket.data?.user?.id;
    console.log(
      `Socket connected ${socket.id}${userId ? ` user:${userId}` : ''}`
    );

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected ${socket.id} reason:${reason}`);
    });
  });

  return io;
};

module.exports = {
  createSocketServer,
};
