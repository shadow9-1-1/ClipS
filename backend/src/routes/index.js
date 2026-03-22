const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const usersRoutes = require('./usersRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', usersRoutes);

module.exports = router;
