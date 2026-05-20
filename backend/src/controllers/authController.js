const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const MealPlan = require('../models/MealPlan');
const Notification = require('../models/Notification');
const ClaimRequest = require('../models/ClaimRequest');
const { sendVerificationEmail, send2FAEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

// ---------------------------------------------------------------------------
// @route   POST /api/auth/register
// @desc    Register user and send email verification OTP
// ---------------------------------------------------------------------------
const register = async (req, res) => {
  try {
    const { name, email, password, phone, householdSize } = req.body;

    // Diagnostic: log which DB Mongoose is actually connected to
    const mongoose = require('mongoose');
    console.log(`[AuthController.register] Connected DB: "${mongoose.connection.db?.databaseName}" | Attempting register for: ${email}`);

    // 1. Basic field validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide all required fields' });
    }

    // 2. Enforce @gmail.com only
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        message: 'Only Gmail (@gmail.com) addresses are accepted for registration.',
      });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      console.log(`[AuthController.register] Duplicate check hit for "${normalizedEmail}" | isVerified: ${existingUser.isVerified} | _id: ${existingUser._id} | createdAt: ${existingUser.createdAt}`);

      // Already verified → genuinely duplicate account, reject
      if (existingUser.isVerified) {
        console.log(`[AuthController.register] Rejecting: verified account exists for "${normalizedEmail}"`);
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Unverified → previous registration attempt where email likely failed.
      // Regenerate OTP and resend so the user can complete verification.
      console.log(`[AuthController.register] Unverified account found — regenerating OTP for "${normalizedEmail}"`);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
      await existingUser.save();

      try {
        await sendVerificationEmail(existingUser.email, verificationCode);
      } catch (emailErr) {
        console.error('[AuthController.register] Resend OTP failed for unverified user:', emailErr.message);
        // Delete so they can retry fresh next time
        await User.deleteOne({ _id: existingUser._id });
        return res.status(500).json({
          success: false,
          emailError: true,
          message: 'Could not deliver the verification email. Please try again.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'A new verification code has been sent to your email. Please check your inbox.',
      });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Generate 6-digit verification OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // 6. Create user (unverified)
    const newUser = new User({
      name,
      email: normalizedEmail,
      passwordHash,
      phone,
      householdSize,
      avatarUrl: '/profile_images/default-avatar-profile.jpg',
      verificationCode,
      verificationCodeExpires,
      isVerified: false,
    });

    await newUser.save();
    console.log(`[AuthController.register] New user created: "${normalizedEmail}" | _id: ${newUser._id}`);

    // 7. Send OTP via real email.
    //    If delivery fails, keep the user as UNVERIFIED (do NOT delete).
    //    The frontend can prompt the user to click 'Resend Code' to retry
    //    via the /resend-verification endpoint.
    try {
      await sendVerificationEmail(normalizedEmail, verificationCode);
    } catch (emailErr) {
      console.error('[AuthController.register] Email delivery failed — user kept as unverified for resend:', emailErr.message);
      return res.status(500).json({
        success: false,
        emailError: true,
        message: 'Account created but we could not deliver the verification email. ' +
                 'Please click "Resend Code" to try again, or check that your Gmail address is correct.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the 6-digit verification code.',
    });
  } catch (error) {
    console.error('[AuthController.register] Unexpected error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ---------------------------------------------------------------------------
// @route   POST /api/auth/verify-email
// @desc    Verify user email with OTP code
// ---------------------------------------------------------------------------
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    // Check expiry first, then code match (prevents timing-based enumeration)
    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Mark as verified and clear OTP fields
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

// ---------------------------------------------------------------------------
// @route   POST /api/auth/login
// @desc    Login — email → password → optional 2FA OTP
// ---------------------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 1. Find user — generic message to prevent email enumeration
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Account no longer exists. Please register a new account.' });
    }

    // 2. Check if verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: 'Please verify your email before logging in' });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. If 2FA enabled — send OTP via email and pause session creation
    if (user.twoFactorEnabled) {
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = twoFactorCode;
      user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await user.save();

      await send2FAEmail(user.email, twoFactorCode);

      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        message: 'A 6-digit verification code has been sent to your email.',
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

    // 5. No 2FA — issue tokens directly
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

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

// ---------------------------------------------------------------------------
// @route   POST /api/auth/verify-2fa
// @desc    Verify 2FA OTP and issue JWT tokens
// ---------------------------------------------------------------------------
const verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check expiry before code to prevent OTP reuse after expiry
    if (!user.twoFactorCodeExpires || user.twoFactorCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    if (user.twoFactorCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Invalidate the used OTP immediately (prevent replay)
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;

    // Issue tokens
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
        phone: user.phone,
        householdSize: user.householdSize,
        avatarUrl: user.avatarUrl,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('[AuthController.verify2FA] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during 2FA verification' });
  }
};

// ---------------------------------------------------------------------------
// @route   POST /api/auth/toggle-2fa
// @desc    Enable or disable 2FA for the logged-in user
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// @route   POST /api/auth/forgot-password
// @desc    Send password reset link via email (token valid 1 hour)
// ---------------------------------------------------------------------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generic response to prevent email enumeration attacks
    const genericResponse = {
      success: true,
      message: 'If that email is registered, you will receive a password reset link shortly.',
    };

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return generic response — do not leak whether email is registered
      return res.status(200).json(genericResponse);
    }

    // Generate a secure random token (raw — only in the email link, never stored)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store the SHA-256 hash of the token in the database
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Build the reset URL (raw token in link, hashed in DB)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json(genericResponse);
  } catch (error) {
    console.error('[AuthController.forgotPassword] Error:', error);
    // Still return generic response on error to prevent leaking info
    res.status(200).json({
      success: true,
      message: 'If that email is registered, you will receive a password reset link shortly.',
    });
  }
};

// ---------------------------------------------------------------------------
// @route   POST /api/auth/reset-password
// @desc    Reset password using token from email link
// ---------------------------------------------------------------------------
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token, email, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Hash the incoming raw token and compare to stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }, // Must not be expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Invalidate the reset token (single-use) and force re-login
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Revoke any active sessions

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    console.error('[AuthController.resetPassword] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

// ---------------------------------------------------------------------------
// @route   POST /api/auth/refresh-token
// ---------------------------------------------------------------------------
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    const jwtSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    const jwt = require('jsonwebtoken');

    jwt.verify(refreshToken, jwtSecret, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: 'Refresh token expired or invalid' });
      }

      const accessToken = generateAccessToken(user._id);
      res.status(200).json({ success: true, accessToken });
    });
  } catch (error) {
    console.error('[AuthController.refreshToken] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during token refresh' });
  }
};

// ---------------------------------------------------------------------------
// @route   POST /api/auth/logout
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// @route   GET /api/auth/profile
// ---------------------------------------------------------------------------
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-passwordHash -verificationCode -twoFactorCode -refreshToken -passwordResetToken',
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

// ---------------------------------------------------------------------------
// @route   PUT /api/auth/profile
// ---------------------------------------------------------------------------
const updateProfile = async (req, res) => {
  try {
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
    ).select('-passwordHash -verificationCode -twoFactorCode -refreshToken -passwordResetToken');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[AuthController.updateProfile] Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// ---------------------------------------------------------------------------
// @route   POST /api/auth/resend-verification
// @desc    Resend signup OTP to an unverified account
//          (recovery path for failed-email on first registration)
// ---------------------------------------------------------------------------
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Generic response — don't reveal whether the account exists
    if (!user || user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'If an unverified account exists for that email, a new code has been sent.',
      });
    }

    // Regenerate OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationCode);
    } catch (emailErr) {
      console.error('[AuthController.resendVerification] Email delivery failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        emailError: true,
        message: 'Failed to send verification email. Please check your SMTP configuration.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an unverified account exists for that email, a new code has been sent.',
    });
  } catch (error) {
    console.error('[AuthController.resendVerification] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during resend' });
  }
};

// ---------------------------------------------------------------------------
// @route   DELETE /api/auth/profile
// @desc    Delete user account and all owned resources (inventory, meal plans, notifications, claims)
// ---------------------------------------------------------------------------
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find user to verify they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Find all food items owned by the user
    const userFoodItems = await FoodItem.find({ userId }).select('_id');
    const foodItemIds = userFoodItems.map(item => item._id);

    // 3. Delete related claim requests (where user is requester OR donation belongs to user)
    await ClaimRequest.deleteMany({
      $or: [
        { requesterId: userId },
        { donationId: { $in: foodItemIds } }
      ]
    });

    // 4. Delete user's food items/donations
    await FoodItem.deleteMany({ userId });

    // 5. Delete user's meal plans
    await MealPlan.deleteMany({ userId });

    // 6. Delete user's notifications
    await Notification.deleteMany({ userId });

    // 7. Delete the user account itself
    await User.findByIdAndDelete(userId);

    console.log(`[AuthController.deleteAccount] Successfully deleted user ${userId} and all related data.`);

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[AuthController.deleteAccount] Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Server error during account deletion' });
  }
};

// ---------------------------------------------------------------------------
// @route   POST /api/auth/resend-2fa
// @desc    Resend login 2FA OTP via email
// ---------------------------------------------------------------------------
const resend2FA = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Invalidate any previous OTP by regenerating it
    const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = twoFactorCode;
    user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    try {
      await send2FAEmail(user.email, twoFactorCode);
    } catch (emailErr) {
      console.error('[AuthController.resend2FA] Email delivery failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        emailError: true,
        message: 'Failed to send 2FA email. Please check your SMTP configuration.',
      });
    }

    res.status(200).json({ success: true, message: 'A new 2FA code has been sent to your email.' });
  } catch (error) {
    console.error('[AuthController.resend2FA] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during 2FA resend' });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  verify2FA,
  toggle2FA,
  forgotPassword,
  resetPassword,
  resendVerification,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  deleteAccount,
  resend2FA,
};
