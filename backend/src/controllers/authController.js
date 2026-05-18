const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

// @route   POST /api/auth/register
// @desc    Register user and send email verification code
const register = async (req, res) => {
  try {
    const { name, email, password, phone, householdSize } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide all required fields' });
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
      phone,
      householdSize,
      avatarUrl: '/profile_images/default-avatar-profile.jpg',
      verificationCode,
      verificationCodeExpires,
      isVerified: false,
    });

    await newUser.save();

    // 6. Send verification email (mocked or real)
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
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

    res
      .status(200)
      .json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('[AuthController.verifyEmail] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user and return JWT (or prompt for 2FA)
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
      return res
        .status(403)
        .json({ success: false, message: 'Please verify your email before logging in' });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      console.log(`[AuthController.login] 2FA is enabled for ${user.email}. Generating code...`);
      // Generate 2FA code
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = twoFactorCode;
      user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
      await user.save();

      // Print to terminal (mock email)
      await sendVerificationEmail(email, twoFactorCode);

      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        message: 'Two-factor authentication code sent. Check your email (or terminal).',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          householdSize: user.householdSize,
          avatarUrl: user.avatarUrl,
        },
      });
    }

    // 5. No 2FA — Generate Tokens directly
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 6. Store refresh token in DB
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
        email: user.email,
        phone: user.phone,
        householdSize: user.householdSize,
        avatarUrl: user.avatarUrl,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @route   POST /api/auth/verify-2fa
// @desc    Verify 2FA code and return tokens
const verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.twoFactorCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (user.twoFactorCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    // Clear the 2FA code
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('[AuthController.verify2FA] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during 2FA verification' });
  }
};

// @route   POST /api/auth/toggle-2fa
// @desc    Enable or disable 2FA for the logged-in user
const toggle2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.twoFactorEnabled = !!enabled;
    await user.save();

    console.log(
      `[AuthController.toggle2FA] 2FA ${enabled ? 'ENABLED' : 'DISABLED'} for ${user.email}`,
    );

    res.status(200).json({
      success: true,
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error('[AuthController.toggle2FA] Error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling 2FA' });
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
        return res
          .status(403)
          .json({ success: false, message: 'Refresh token expired or invalid' });
      }

      // Generate new access token
      const accessToken = generateAccessToken(user._id);

      res.status(200).json({
        success: true,
        accessToken,
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
      return res
        .status(400)
        .json({ success: false, message: 'Refresh token is required for logout' });
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

// @route   GET /api/auth/profile
// @desc    Get user profile and preferences
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-passwordHash -verificationCode -twoFactorCode -refreshToken',
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Assign random profile image for Bagus or Ivan if empty
    if (
      (user.name.includes('Bagus') || user.name.includes('Ivan')) &&
      (!user.avatarUrl || user.avatarUrl === '')
    ) {
      const images = [
        '/profile_images/bmw-m4-gt4-evo-3840x2160-17398.jpg',
        '/profile_images/mclaren-artura-3840x2160-17637.jpg',
        '/profile_images/pexels-vlad-alexandru-popa-1402787.jpg',
      ];
      user.avatarUrl = images[Math.floor(Math.random() * images.length)];
      await user.save();
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[AuthController.getProfile] Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile and preferences
const updateProfile = async (req, res) => {
  try {
    // Only allow updating certain fields (prevent role/password hijacking)
    const allowedUpdates = [
      'name',
      'phone',
      'householdSize',
      'avatarUrl',
      'expiryAlerts',
      'donationUpdates',
      'weeklySummary',
      'diets',
      'donationVisibility',
      'locationPrivacy',
      'dataAnalyticsOptIn',
      'expiryThreshold',
      'alertMealReminders',
      'deliveryChannel',
      'storageLocations',
      'pickupLocations',
      'preferredCategories',
    ];

    const updateData = {};
    for (const key of Object.keys(req.body)) {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true },
    ).select('-passwordHash -verificationCode -twoFactorCode -refreshToken');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[AuthController.updateProfile] Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  verify2FA,
  toggle2FA,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
};
