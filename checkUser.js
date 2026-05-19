require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const dbName = mongoose.connection.db?.databaseName;
  console.log(`\n=== Connected to DB: "${dbName}" ===`);

  const users = await User.find({}, 'email isVerified createdAt').sort({ createdAt: -1 });

  if (users.length === 0) {
    console.log('No users found in this database.');
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((u, i) => {
      console.log(`  [${i + 1}] ${u.email} | verified: ${u.isVerified} | created: ${u.createdAt}`);
    });
  }

  console.log('\n--- Done ---');
  process.exit(0);
}).catch(err => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});
