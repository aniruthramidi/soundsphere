/**
 * Input Data Validation & Sanitization Middleware
 * Built using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Middleware that inspects validationResult and halts execution with 422 if invalid.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    return next(new AppError('Validation failed. Please verify your input parameters.', 422, errorDetails));
  }
  next();
};

/**
 * User Registration Validation Rules
 */
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain alphanumeric characters and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Must provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['listener', 'creator', 'admin']).withMessage('Role must be listener, creator, or admin'),
  handleValidationErrors
];

/**
 * User Login Validation Rules
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Profile Update Validation Rules
 */
const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain alphanumeric characters and underscores'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('avatar_url')
    .optional()
    .trim(),
  handleValidationErrors
];

/**
 * Password Update Validation Rules
 */
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  handleValidationErrors
];

/**
 * Track Creation / Update Validation Rules
 */
const validateTrack = [
  body('title')
    .trim()
    .notEmpty().withMessage('Track title is required')
    .isLength({ max: 120 }).withMessage('Track title cannot exceed 120 characters'),
  body('artist')
    .trim()
    .notEmpty().withMessage('Artist name is required')
    .isLength({ max: 100 }).withMessage('Artist name cannot exceed 100 characters'),
  body('genre')
    .trim()
    .notEmpty().withMessage('Genre is required')
    .isLength({ max: 50 }).withMessage('Genre cannot exceed 50 characters'),
  body('duration')
    .notEmpty().withMessage('Duration is required (in seconds)')
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer representing seconds'),
  body('audio')
    .trim()
    .notEmpty().withMessage('Audio URL or file path is required'),
  body('album')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('artwork')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('release_year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Release year must be between 1900 and 2100'),
  handleValidationErrors
];

/**
 * Playlist Creation / Update Validation Rules
 */
const validatePlaylist = [
  body('title')
    .trim()
    .notEmpty().withMessage('Playlist title is required')
    .isLength({ max: 100 }).withMessage('Playlist title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('artwork')
    .optional()
    .trim(),
  body('is_public')
    .optional()
    .isBoolean().withMessage('is_public must be a boolean (true/false)'),
  handleValidationErrors
];

/**
 * Add Track to Playlist Validation Rules
 */
const validatePlaylistTrack = [
  body('track_id')
    .notEmpty().withMessage('track_id is required')
    .isInt({ min: 1 }).withMessage('track_id must be a positive integer'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordUpdate,
  validateTrack,
  validatePlaylist,
  validatePlaylistTrack,
  handleValidationErrors
};
