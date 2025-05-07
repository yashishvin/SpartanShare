const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const auth = require('../../middleware/auth');

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post('/google', authController.googleLogin);

// @route   GET /api/auth/verify
// @desc    Verify token & get user data
// @access  Private
router.get('/verify', auth, authController.verifyToken);

module.exports = router;