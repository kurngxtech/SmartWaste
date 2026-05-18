const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

// @route   POST /api/auth/register
// @desc    Register user and send email verification code
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // 5. Create user
    const newUser = new User({
      name,
      email,
      passwordHash,
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    });

    await newUser.save();

    // 6. Send verification email (mocked or real)
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.'
    });

  } catch (error) {
    console.error('[AuthController.register] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @route   POST /api/auth/verify-email
// @desc    Verify user email with code
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    // Check code expiry and match
    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });

  } catch (error) {
    console.error('[AuthController.verifyEmail] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user and return JWT
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // 2. Check if verified
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Generate Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 5. Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @route   POST /api/auth/refresh-token
// @desc    Get new access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    // 1. Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    // 2. Verify token
    const jwtSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    
    // We use require('jsonwebtoken') here since we only exported generation in utils
    const jwt = require('jsonwebtoken');
    
    jwt.verify(refreshToken, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Refresh token expired or invalid' });
      }

      // Generate new access token
      const accessToken = generateAccessToken(user._id);
      
      res.status(200).json({
        success: true,
        accessToken
      });
    });

  } catch (error) {
    console.error('[AuthController.refreshToken] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during token refresh' });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user by invalidating refresh token
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required for logout' });
    }

    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[AuthController.logout] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout
};
