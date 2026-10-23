/**
 * Track Management Controller
 * Handles CRUD operations, search, filters, playback logging, and like toggling.
 */

const { getDb } = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all tracks with search, genre filter, pagination, and sorting
 * GET /api/v1/tracks
 */
const getTracks = asyncHandler(async (req, res) => {
  const db = getDb();
  const {
    q,
    genre,
    sortBy = 'id',
    order = 'asc',
    page = 1,
    limit = 50
  } = req.query;

  const validSortFields = ['id', 'title', 'artist', 'album', 'genre', 'duration', 'plays', 'release_year', 'created_at'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'id';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (q && q.trim()) {
    conditions.push('(title LIKE ? OR artist LIKE ? OR album LIKE ?)');
    const searchTerm = `%${q.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (genre && genre.trim() && genre.toLowerCase() !== 'all') {
    conditions.push('LOWER(genre) = LOWER(?)');
    params.push(genre.trim());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count for pagination
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM tracks ${whereClause}`);
  const { total } = countStmt.get(...params);

  // Fetch paginated rows
  const querySQL = `
    SELECT * FROM tracks
    ${whereClause}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT ? OFFSET ?
  `;
  const tracks = db.prepare(querySQL).all(...params, limitNum, offset);

  // If user is authenticated, check if liked
  const userId = req.user ? req.user.id : null;
  let userLikedTrackIds = new Set();
  if (userId) {
    const likes = db.prepare('SELECT track_id FROM favorites WHERE user_id = ?').all(userId);
    userLikedTrackIds = new Set(likes.map((l) => l.track_id));
  }

  const formattedTracks = tracks.map((track) => ({
    ...track,
    liked: userId ? userLikedTrackIds.has(track.id) : false
  }));

  res.status(200).json({
    success: true,
    count: formattedTracks.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: formattedTracks
  });
});

/**
 * Get single track by ID
 * GET /api/v1/tracks/:id
 */
const getTrackById = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const trackId = parseInt(req.params.id, 10);

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID. Must be an integer.', 400));
  }

  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return next(new AppError(`Track with ID ${trackId} not found.`, 404));
  }

  const userId = req.user ? req.user.id : null;
  let liked = false;
  if (userId) {
    const fav = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND track_id = ?').get(userId, trackId);
    liked = Boolean(fav);
  }

  // Get creator info if available
  let creator = null;
  if (track.created_by) {
    creator = db.prepare('SELECT id, username, avatar_url FROM users WHERE id = ?').get(track.created_by);
  }

  res.status(200).json({
    success: true,
    data: {
      ...track,
      liked,
      creator
    }
  });
});

/**
 * Create a new track
 * POST /api/v1/tracks
 */
const createTrack = asyncHandler(async (req, res) => {
  const db = getDb();
  const {
    title,
    artist,
    album = 'Single',
    genre,
    duration,
    artwork = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audio,
    description = '',
    release_year = new Date().getFullYear()
  } = req.body;

  const userId = req.user.id;

  const stmt = db.prepare(`
    INSERT INTO tracks (title, artist, album, genre, duration, artwork, audio, description, release_year, plays, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `);

  const result = stmt.run(
    title,
    artist,
    album,
    genre,
    duration,
    artwork,
    audio,
    description,
    release_year,
    userId
  );

  const newTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(Number(result.lastInsertRowid));

  res.status(201).json({
    success: true,
    message: 'Track created successfully',
    data: {
      ...newTrack,
      liked: false
    }
  });
});

/**
 * Update an existing track
 * PUT /api/v1/tracks/:id
 */
const updateTrack = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const trackId = parseInt(req.params.id, 10);

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID.', 400));
  }

  const existingTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
  if (!existingTrack) {
    return next(new AppError(`Track with ID ${trackId} not found.`, 404));
  }

  // Check authorization: Admin or track creator
  if (req.user.role !== 'admin' && existingTrack.created_by !== req.user.id) {
    return next(new AppError('Forbidden: You can only edit tracks that you created.', 403));
  }

  const {
    title = existingTrack.title,
    artist = existingTrack.artist,
    album = existingTrack.album,
    genre = existingTrack.genre,
    duration = existingTrack.duration,
    artwork = existingTrack.artwork,
    audio = existingTrack.audio,
    description = existingTrack.description,
    release_year = existingTrack.release_year
  } = req.body;

  const updateStmt = db.prepare(`
    UPDATE tracks
    SET title = ?, artist = ?, album = ?, genre = ?, duration = ?,
        artwork = ?, audio = ?, description = ?, release_year = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  updateStmt.run(title, artist, album, genre, duration, artwork, audio, description, release_year, trackId);
  const updatedTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);

  res.status(200).json({
    success: true,
    message: 'Track updated successfully',
    data: updatedTrack
  });
});

/**
 * Delete a track
 * DELETE /api/v1/tracks/:id
 */
const deleteTrack = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const trackId = parseInt(req.params.id, 10);

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID.', 400));
  }

  const existingTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);
  if (!existingTrack) {
    return next(new AppError(`Track with ID ${trackId} not found.`, 404));
  }

  if (req.user.role !== 'admin' && existingTrack.created_by !== req.user.id) {
    return next(new AppError('Forbidden: You can only delete tracks that you created.', 403));
  }

  db.prepare('DELETE FROM tracks WHERE id = ?').run(trackId);

  res.status(200).json({
    success: true,
    message: 'Track deleted successfully'
  });
});

/**
 * Record a play event and increment play count
 * POST /api/v1/tracks/:id/play
 */
const playTrack = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const trackId = parseInt(req.params.id, 10);

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID.', 400));
  }

  const track = db.prepare('SELECT id, plays FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return next(new AppError(`Track with ID ${trackId} not found.`, 404));
  }

  // Increment play count
  db.prepare('UPDATE tracks SET plays = plays + 1 WHERE id = ?').run(trackId);

  // Log in play history
  const userId = req.user ? req.user.id : null;
  db.prepare('INSERT INTO play_history (user_id, track_id) VALUES (?, ?)').run(userId, trackId);

  const updated = db.prepare('SELECT id, plays FROM tracks WHERE id = ?').get(trackId);

  res.status(200).json({
    success: true,
    message: 'Playback logged successfully',
    data: {
      trackId,
      plays: updated.plays
    }
  });
});

/**
 * Toggle like/favorite status for authenticated user
 * POST /api/v1/tracks/:id/like
 */
const toggleLike = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const trackId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(trackId)) {
    return next(new AppError('Invalid track ID.', 400));
  }

  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return next(new AppError(`Track with ID ${trackId} not found.`, 404));
  }

  const existingFav = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND track_id = ?').get(userId, trackId);

  let liked = false;
  if (existingFav) {
    db.prepare('DELETE FROM favorites WHERE id = ?').run(existingFav.id);
    liked = false;
  } else {
    db.prepare('INSERT INTO favorites (user_id, track_id) VALUES (?, ?)').run(userId, trackId);
    liked = true;
  }

  res.status(200).json({
    success: true,
    liked,
    message: liked ? 'Track added to favorites' : 'Track removed from favorites'
  });
});

/**
 * Get trending tracks
 * GET /api/v1/tracks/trending
 */
const getTrending = asyncHandler(async (req, res) => {
  const db = getDb();
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5));

  const tracks = db.prepare('SELECT * FROM tracks ORDER BY plays DESC LIMIT ?').all(limit);

  const userId = req.user ? req.user.id : null;
  let userLikedTrackIds = new Set();
  if (userId) {
    const likes = db.prepare('SELECT track_id FROM favorites WHERE user_id = ?').all(userId);
    userLikedTrackIds = new Set(likes.map((l) => l.track_id));
  }

  const formattedTracks = tracks.map((track) => ({
    ...track,
    liked: userId ? userLikedTrackIds.has(track.id) : false
  }));

  res.status(200).json({
    success: true,
    count: formattedTracks.length,
    data: formattedTracks
  });
});

/**
 * Get distinct genres and track counts
 * GET /api/v1/tracks/genres
 */
const getGenres = asyncHandler(async (req, res) => {
  const db = getDb();
  const genres = db.prepare(`
    SELECT genre, COUNT(*) as track_count
    FROM tracks
    GROUP BY genre
    ORDER BY track_count DESC, genre ASC
  `).all();

  res.status(200).json({
    success: true,
    count: genres.length,
    data: genres
  });
});

module.exports = {
  getTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  playTrack,
  toggleLike,
  getTrending,
  getGenres
};
