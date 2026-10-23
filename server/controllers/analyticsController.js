/**
 * Analytics and User Dashboard Controller
 * Aggregates playback metrics, listening history, and tailored recommendations.
 */

const { getDb } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get comprehensive dashboard analytics for the current user
 * GET /api/v1/analytics/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  // 1. Total songs played count
  const playCountRow = db.prepare('SELECT COUNT(*) as count FROM play_history WHERE user_id = ?').get(userId);
  const songsPlayed = playCountRow ? playCountRow.count : 0;

  // 2. Total duration listened (in seconds)
  const durationRow = db.prepare(`
    SELECT COALESCE(SUM(t.duration), 0) as total_duration
    FROM play_history ph
    JOIN tracks t ON ph.track_id = t.id
    WHERE ph.user_id = ?
  `).get(userId);
  const totalSeconds = durationRow ? durationRow.total_duration : 0;
  const hoursListened = (totalSeconds / 3600).toFixed(1);

  // 3. Favorite / Top Genre
  const topGenreRow = db.prepare(`
    SELECT t.genre, COUNT(*) as play_count
    FROM play_history ph
    JOIN tracks t ON ph.track_id = t.id
    WHERE ph.user_id = ?
    GROUP BY t.genre
    ORDER BY play_count DESC
    LIMIT 1
  `).get(userId);
  const favoriteGenre = topGenreRow ? topGenreRow.genre : 'Electronic';

  // 4. Playlists created by user
  const playlistCountRow = db.prepare('SELECT COUNT(*) as count FROM playlists WHERE user_id = ?').get(userId);
  const playlistsCreated = playlistCountRow ? playlistCountRow.count : 0;

  // 5. Total liked tracks
  const favoritesCountRow = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?').get(userId);
  const favoritesCount = favoritesCountRow ? favoritesCountRow.count : 0;

  // 6. Recently played tracks (last 8)
  const recentTracks = db.prepare(`
    SELECT t.*, ph.played_at
    FROM play_history ph
    JOIN tracks t ON ph.track_id = t.id
    WHERE ph.user_id = ?
    ORDER BY ph.played_at DESC
    LIMIT 8
  `).all(userId);

  // 7. Smart recommendations (tracks in favorite genre that user hasn't played recently)
  const recommendations = db.prepare(`
    SELECT * FROM tracks
    WHERE genre = ?
    ORDER BY plays DESC
    LIMIT 6
  `).all(favoriteGenre);

  // Annotate liked status
  const userLikes = db.prepare('SELECT track_id FROM favorites WHERE user_id = ?').all(userId);
  const likedTrackIds = new Set(userLikes.map((l) => l.track_id));

  res.status(200).json({
    success: true,
    data: {
      stats: {
        songsPlayed,
        hoursListened: parseFloat(hoursListened),
        totalSeconds,
        favoriteGenre,
        playlistsCreated,
        favoritesCount
      },
      recentlyPlayed: recentTracks.map((t) => ({ ...t, liked: likedTrackIds.has(t.id) })),
      recommendations: recommendations.map((t) => ({ ...t, liked: likedTrackIds.has(t.id) }))
    }
  });
});

/**
 * Get paginated play history for user
 * GET /api/v1/analytics/history
 */
const getPlayHistory = asyncHandler(async (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const totalRow = db.prepare('SELECT COUNT(*) as count FROM play_history WHERE user_id = ?').get(userId);
  const total = totalRow ? totalRow.count : 0;

  const history = db.prepare(`
    SELECT ph.id as history_id, ph.played_at, t.*
    FROM play_history ph
    JOIN tracks t ON ph.track_id = t.id
    WHERE ph.user_id = ?
    ORDER BY ph.played_at DESC
    LIMIT ? OFFSET ?
  `).all(userId, limit, offset);

  res.status(200).json({
    success: true,
    count: history.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: history
  });
});

module.exports = {
  getDashboardStats,
  getPlayHistory
};
