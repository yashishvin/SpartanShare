const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  console.log('Google login route hit!');
  console.log('Received token:', req.body.token ? 'Token exists' : 'No token');
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    // Get user info from token
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;
    
    // Validate SJSU email
    if (!email.endsWith('@sjsu.edu')) {
      return res.status(403).json({
        success: false,
        message: 'Only SJSU email addresses are allowed'
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        name,
        profilePicture: picture
      });
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
  try {
    // User will be attached to req by auth middleware
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};