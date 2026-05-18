const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Example protected route to demonstrate the middleware
router.get('/profile', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to your profile', userId: req.user.id });
});

module.exports = router;
