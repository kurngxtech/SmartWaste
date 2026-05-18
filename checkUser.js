require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ email: 'spacetoon24012005@gmail.com' });
  console.log('User 2FA Enabled:', user.twoFactorEnabled);
  process.exit(0);
});
