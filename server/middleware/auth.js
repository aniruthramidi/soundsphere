/**
 * Authentication and Role-Based Authorization Middleware
 * Uses JSON Web Tokens (JWT) and SQLite User Lookup
 */

const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const { AppError, asyncHandler } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'soundsphere_super_secret_jwt_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generates a signed JWT for an authenticated user.
 * @param {object} user
 * @returns {string}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Middleware: Verifies Bearer JWT Token in Authorization header.
 * Attaches sanitized user record to req.user.
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Missing Bearer token in Authorization header.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }

  const db = getDb();
  const stmt = db.prepare('SELECT id, username, email, role, avatar_url, bio, created_at FROM users WHERE id = ?');
  const user = stmt.get(decoded.id);

  if (!user) {
    return next(new AppError('The user associated with this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

/**
 * Middleware: Optional Authentication.
 * If token is present and valid, attaches req.user; otherwise proceeds with req.user = null.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const stmt = db.prepare('SELECT id, username, email, role, avatar_url, bio, created_at FROM users WHERE id = ?');
    const user = stmt.get(decoded.id);
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
});

/**
 * Middleware: Role-Based Access Control (RBAC).
 * Restricts access to specified roles (e.g. 'admin', 'creator').
 * @param  {...string} roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before checking permissions.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Forbidden: Access requires one of [${roles.join(', ')}] permissions. Current role is '${req.user.role}'.`, 403));
    }
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  optionalAuth,
  requireRole
};
