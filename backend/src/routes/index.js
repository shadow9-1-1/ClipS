const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const usersRoutes = require('./usersRoutes');
const videoRoutes = require('./videoRoutes');
const storageRoutes = require('./storageRoutes');
const paymentRoutes = require('./paymentRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', usersRoutes);
router.use('/videos', videoRoutes);
router.use('/storage', storageRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
