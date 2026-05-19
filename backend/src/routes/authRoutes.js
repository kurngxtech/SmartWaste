const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification); // Recovery: resend OTP if email failed
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/toggle-2fa', protect, toggle2FA);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
