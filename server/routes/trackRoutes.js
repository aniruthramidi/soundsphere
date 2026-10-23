/**
 * Track Routes
 */

const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { validateTrack } = require('../middleware/validator');

// Public & optional-auth routes
router.get('/', optionalAuth, trackController.getTracks);
router.get('/trending', optionalAuth, trackController.getTrending);
router.get('/genres', trackController.getGenres);
router.get('/:id', optionalAuth, trackController.getTrackById);

// Public play event logger (supports anonymous or authenticated tracking)
router.post('/:id/play', optionalAuth, trackController.playTrack);

// Authenticated routes
router.post('/', verifyToken, validateTrack, trackController.createTrack);
router.put('/:id', verifyToken, trackController.updateTrack);
router.delete('/:id', verifyToken, trackController.deleteTrack);
router.post('/:id/like', verifyToken, trackController.toggleLike);

module.exports = router;
