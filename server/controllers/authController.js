/**
 * Authentication and User Management Controller
 */

const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, role = 'listener', avatar_url, bio } = req.body;
  const db = getDb();

  // Check for existing user with same email
  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingEmail) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  // Check for existing username
  const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUsername) {
    return next(new AppError('This username is already taken. Please choose another.', 409));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const defaultAvatar = avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, role, avatar_url, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(username, email, passwordHash, role, defaultAvatar, bio || null);
  const userId = Number(result.lastInsertRowid);

  const newUser = db.prepare('SELECT id, username, email, role, avatar_url, bio, created_at FROM users WHERE id = ?').get(userId);
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: newUser
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const sanitizedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
    bio: user.bio,
    created_at: user.created_at
  };

  const token = generateToken(sanitizedUser);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: sanitizedUser
  });
});

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

/**
 * Update authenticated user profile
 * PUT /api/v1/auth/profile
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const { username, bio, avatar_url } = req.body;
  const db = getDb();
  const userId = req.user.id;

  if (username && username !== req.user.username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
    if (existing) {
      return next(new AppError('Username is already in use by another account.', 409));
    }
  }

  const updatedUsername = username || req.user.username;
  const updatedBio = bio !== undefined ? bio : req.user.bio;
  const updatedAvatar = avatar_url || req.user.avatar_url;

  const stmt = db.prepare(`
    UPDATE users
    SET username = ?, bio = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(updatedUsername, updatedBio, updatedAvatar, userId);

  const updatedUser = db.prepare('SELECT id, username, email, role, avatar_url, bio, created_at, updated_at FROM users WHERE id = ?').get(userId);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

/**
 * Change authenticated user password
 * PUT /api/v1/auth/password
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDb();
  const userId = req.user.id;

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isMatch) {
    return next(new AppError('Current password is incorrect.', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, userId);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Logout acknowledgment
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully. Please clear client-side token.'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  logout
};
