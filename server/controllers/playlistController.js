/**
 * Playlist Management Controller
 * Handles CRUD operations, track additions/removals, and playlist population.
 */

const { getDb } = require('../config/database');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get playlists (public playlists + current user's private playlists)
 * GET /api/v1/playlists
 */
const getPlaylists = asyncHandler(async (req, res) => {
  const db = getDb();
  const userId = req.user ? req.user.id : null;

  let querySQL;
  let params;

  if (userId) {
    querySQL = `
      SELECT p.*, u.username as creator_name,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_public = 1 OR p.user_id = ?
      ORDER BY p.created_at DESC
    `;
    params = [userId];
  } else {
    querySQL = `
      SELECT p.*, u.username as creator_name,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_public = 1
      ORDER BY p.created_at DESC
    `;
    params = [];
  }

  const playlists = db.prepare(querySQL).all(...params);

  // Attach trackIds for frontend compatibility
  const getTrackIdsStmt = db.prepare('SELECT track_id FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC');
  const formattedPlaylists = playlists.map((p) => {
    const trackRows = getTrackIdsStmt.all(p.id);
    return {
      ...p,
      trackCount: p.track_count,
      trackIds: trackRows.map((r) => r.track_id)
    };
  });

  res.status(200).json({
    success: true,
    count: formattedPlaylists.length,
    data: formattedPlaylists
  });
});

/**
 * Get single playlist by ID with full track details
 * GET /api/v1/playlists/:id
 */
const getPlaylistById = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const playlistId = req.params.id;

  const playlist = db.prepare(`
    SELECT p.*, u.username as creator_name, u.avatar_url as creator_avatar
    FROM playlists p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(playlistId);

  if (!playlist) {
    return next(new AppError(`Playlist with ID '${playlistId}' not found.`, 404));
  }

  const userId = req.user ? req.user.id : null;
  if (!playlist.is_public && (!userId || (playlist.user_id !== userId && req.user.role !== 'admin'))) {
    return next(new AppError('Forbidden: This playlist is private.', 403));
  }

  // Fetch ordered tracks in this playlist
  const tracksSQL = `
    SELECT t.*, pt.position, pt.added_at
    FROM playlist_tracks pt
    JOIN tracks t ON pt.track_id = t.id
    WHERE pt.playlist_id = ?
    ORDER BY pt.position ASC
  `;
  const tracks = db.prepare(tracksSQL).all(playlistId);

  // If user authenticated, annotate liked tracks
  let userLikedTrackIds = new Set();
  if (userId) {
    const likes = db.prepare('SELECT track_id FROM favorites WHERE user_id = ?').all(userId);
    userLikedTrackIds = new Set(likes.map((l) => l.track_id));
  }

  const tracksWithLiked = tracks.map((t) => ({
    ...t,
    liked: userId ? userLikedTrackIds.has(t.id) : false
  }));

  res.status(200).json({
    success: true,
    data: {
      ...playlist,
      trackCount: tracks.length,
      trackIds: tracks.map((t) => t.id),
      tracks: tracksWithLiked
    }
  });
});

/**
 * Create a new playlist
 * POST /api/v1/playlists
 */
const createPlaylist = asyncHandler(async (req, res) => {
  const db = getDb();
  const {
    title,
    description = '',
    artwork = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    is_public = true,
    trackIds = []
  } = req.body;

  const userId = req.user.id;
  const playlistId = `pl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const insertStmt = db.prepare(`
    INSERT INTO playlists (id, user_id, title, description, artwork, is_public)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(playlistId, userId, title, description, artwork, is_public ? 1 : 0);

  // Insert initial tracks if provided
  if (Array.isArray(trackIds) && trackIds.length > 0) {
    const insertPt = db.prepare(`
      INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position)
      VALUES (?, ?, ?)
    `);
    trackIds.forEach((tId, idx) => {
      insertPt.run(playlistId, parseInt(tId, 10), idx + 1);
    });
  }

  const createdPlaylist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);

  res.status(201).json({
    success: true,
    message: 'Playlist created successfully',
    data: {
      ...createdPlaylist,
      trackCount: trackIds.length,
      trackIds
    }
  });
});

/**
 * Update an existing playlist
 * PUT /api/v1/playlists/:id
 */
const updatePlaylist = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const playlistId = req.params.id;

  const existing = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);
  if (!existing) {
    return next(new AppError(`Playlist with ID '${playlistId}' not found.`, 404));
  }

  if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
    return next(new AppError('Forbidden: You can only edit playlists you created.', 403));
  }

  const {
    title = existing.title,
    description = existing.description,
    artwork = existing.artwork,
    is_public = existing.is_public
  } = req.body;

  const stmt = db.prepare(`
    UPDATE playlists
    SET title = ?, description = ?, artwork = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(title, description, artwork, is_public ? 1 : 0, playlistId);
  const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);

  res.status(200).json({
    success: true,
    message: 'Playlist updated successfully',
    data: updated
  });
});

/**
 * Delete a playlist
 * DELETE /api/v1/playlists/:id
 */
const deletePlaylist = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const playlistId = req.params.id;

  const existing = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);
  if (!existing) {
    return next(new AppError(`Playlist with ID '${playlistId}' not found.`, 404));
  }

  if (req.user.role !== 'admin' && existing.user_id !== req.user.id) {
    return next(new AppError('Forbidden: You can only delete playlists you created.', 403));
  }

  db.prepare('DELETE FROM playlists WHERE id = ?').run(playlistId);

  res.status(200).json({
    success: true,
    message: 'Playlist deleted successfully'
  });
});

/**
 * Add a track to playlist
 * POST /api/v1/playlists/:id/tracks
 */
const addTrackToPlaylist = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const playlistId = req.params.id;
  const trackId = parseInt(req.body.track_id, 10);

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);
  if (!playlist) {
    return next(new AppError(`Playlist with ID '${playlistId}' not found.`, 404));
  }

  if (req.user.role !== 'admin' && playlist.user_id !== req.user.id) {
    return next(new AppError('Forbidden: You can only add tracks to your own playlist.', 403));
  }

  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return next(new AppError(`Track with ID ${trackId} does not exist.`, 404));
  }

  const existingEntry = db.prepare('SELECT id FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?').get(playlistId, trackId);
  if (existingEntry) {
    return next(new AppError('This track is already in the playlist.', 409));
  }

  const maxPos = db.prepare('SELECT MAX(position) as max_pos FROM playlist_tracks WHERE playlist_id = ?').get(playlistId);
  const nextPos = (maxPos.max_pos || 0) + 1;

  db.prepare('INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?)').run(playlistId, trackId, nextPos);

  const updatedTracks = db.prepare('SELECT track_id FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC').all(playlistId);

  res.status(201).json({
    success: true,
    message: 'Track added to playlist',
    data: {
      playlistId,
      trackId,
      position: nextPos,
      trackCount: updatedTracks.length,
      trackIds: updatedTracks.map((r) => r.track_id)
    }
  });
});

/**
 * Remove a track from playlist
 * DELETE /api/v1/playlists/:id/tracks/:trackId
 */
const removeTrackFromPlaylist = asyncHandler(async (req, res, next) => {
  const db = getDb();
  const playlistId = req.params.id;
  const trackId = parseInt(req.params.trackId, 10);

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);
  if (!playlist) {
    return next(new AppError(`Playlist with ID '${playlistId}' not found.`, 404));
  }

  if (req.user.role !== 'admin' && playlist.user_id !== req.user.id) {
    return next(new AppError('Forbidden: You can only remove tracks from your own playlist.', 403));
  }

  const deleteResult = db.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?').run(playlistId, trackId);
  if (deleteResult.changes === 0) {
    return next(new AppError('Track was not found in this playlist.', 404));
  }

  const updatedTracks = db.prepare('SELECT track_id FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC').all(playlistId);

  res.status(200).json({
    success: true,
    message: 'Track removed from playlist',
    data: {
      playlistId,
      trackId,
      trackCount: updatedTracks.length,
      trackIds: updatedTracks.map((r) => r.track_id)
    }
  });
});

module.exports = {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist
};
