/**
 * Analytics and Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/history', analyticsController.getPlayHistory);

module.exports = router;
