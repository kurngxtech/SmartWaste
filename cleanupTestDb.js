/**
 * cleanupTestDb.js
 * ----------------
 * One-shot cleanup: deletes ALL user documents from the old default 'test'
 * database that Mongoose was writing to before the DB name was added to
 * MONGODB_URI. Run once, then delete this file.
 *
 *   node cleanupTestDb.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Force-connect to 'test' regardless of .env DB name
const baseUri = process.env.MONGODB_URI.replace(/\/([^/?]+)(\?|$)/, '/').replace(/\/$/, '');
const testUri = `${baseUri}/test`;

const User = require('./backend/src/models/User');

(async () => {
  try {
    await mongoose.connect(testUri);
    const db = mongoose.connection.db?.databaseName;
    console.log(`\n=== Connected to DB: "${db}" ===`);

    const users = await User.find({}, 'email isVerified createdAt');
    if (users.length === 0) {
      console.log('✅  No stale users found in "test" database. Nothing to clean up.');
    } else {
      console.log(`Found ${users.length} stale user(s) in "test":\n`);
      users.forEach((u, i) => {
        console.log(`  [${i + 1}] ${u.email} | verified: ${u.isVerified} | created: ${u.createdAt}`);
      });

      const result = await User.deleteMany({});
      console.log(`\n🗑️  Deleted ${result.deletedCount} user(s) from "test" database.`);
    }

    console.log('\n--- Done. You can delete cleanupTestDb.js now. ---\n');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
