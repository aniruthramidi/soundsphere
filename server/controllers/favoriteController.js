/**
 * Favorites / User Library Controller
 * Handles user's liked tracks and library operations
 */

const { getDb } = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all favorited tracks for current user
 * GET /api/v1/favorites
 */
const getFavorites = asyncHandler(async (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  const querySQL = `
    SELECT t.*, f.created_at as favorited_at
    FROM favorites f
    JOIN tracks t ON f.track_id = t.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;
  const tracks = db.prepare(querySQL).all(userId);

  const formatted = tracks.map((t) => ({
    ...t,
    liked: true
  }));

  res.status(200).json({
    success: true,
    count: formatted.length,
    data: formatted
  });
});

/**
 * Add track to favorites
 * POST /api/v1/favorites/:trackId
 */
const addFavorite = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const userId = req.user.id;
  const trackId = parseInt(req.params.trackId, 10);

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID.', 400));
  }

  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return next(new AppError(`Track with ID ${trackId} not found.`, 404));
  }

  db.prepare('INSERT OR IGNORE INTO favorites (user_id, track_id) VALUES (?, ?)').run(userId, trackId);

  res.status(201).json({
    success: true,
    liked: true,
    message: 'Track added to favorites'
  });
});

/**
 * Remove track from favorites
 * DELETE /api/v1/favorites/:trackId
 */
const removeFavorite = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const userId = req.user.id;
  const trackId = parseInt(req.params.trackId, 10);

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID.', 400));
  }

  db.prepare('DELETE FROM favorites WHERE user_id = ? AND track_id = ?').run(userId, trackId);

  res.status(200).json({
    success: true,
    liked: false,
    message: 'Track removed from favorites'
  });
});

/**
 * Check if a track is favorited by current user
 * GET /api/v1/favorites/check/:trackId
 */
const checkFavorite = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const userId = req.user.id;
  const trackId = parseInt(req.params.trackId, 10);

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID.', 400));
  }

  const fav = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND track_id = ?').get(userId, trackId);

  res.status(200).json({
    success: true,
    trackId,
    liked: Boolean(fav)
  });
});

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};
