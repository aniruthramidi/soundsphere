/**
 * Favorites / User Library Routes
 */

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', favoriteController.getFavorites);
router.post('/:trackId', favoriteController.addFavorite);
router.delete('/:trackId', favoriteController.removeFavorite);
router.get('/check/:trackId', favoriteController.checkFavorite);

module.exports = router;
