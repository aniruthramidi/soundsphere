/**
 * Playlist Routes
 */

const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { validatePlaylist, validatePlaylistTrack } = require('../middleware/validator');

router.get('/', optionalAuth, playlistController.getPlaylists);
router.get('/:id', optionalAuth, playlistController.getPlaylistById);

router.post('/', verifyToken, validatePlaylist, playlistController.createPlaylist);
router.put('/:id', verifyToken, playlistController.updatePlaylist);
router.delete('/:id', verifyToken, playlistController.deletePlaylist);

router.post('/:id/tracks', verifyToken, validatePlaylistTrack, playlistController.addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', verifyToken, playlistController.removeTrackFromPlaylist);

module.exports = router;
