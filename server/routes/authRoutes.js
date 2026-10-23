/**
 * Authentication and User Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordUpdate
} = require('../middleware/validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, validateProfileUpdate, authController.updateProfile);
router.put('/password', verifyToken, validatePasswordUpdate, authController.updatePassword);
router.post('/logout', authController.logout);

module.exports = router;
