/**
 * test-email.js  —  SavePlate SMTP Diagnostic Script
 *
 * Run from the PROJECT ROOT (where .env lives):
 *   node backend/test-email.js
 *
 * What it checks:
 *  1. SMTP_USER and SMTP_PASS are present in .env
 *  2. nodemailer can authenticate with Gmail (transporter.verify)
 *  3. A real test email is delivered to SMTP_USER's own inbox
 */

require('dotenv').config(); // loads .env from cwd (run from project root)
const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

console.log('\n====================================================');
console.log('  SavePlate — SMTP Email Diagnostic');
console.log('====================================================\n');

// Step 1: Check env vars
if (!SMTP_USER || !SMTP_PASS) {
  console.error('❌ SMTP_USER or SMTP_PASS is not set in .env');
  console.error('   Add them and re-run this script.\n');
  process.exit(1);
}

if (SMTP_USER === 'your_gmail@gmail.com' || SMTP_PASS === 'your_16_char_app_password') {
  console.error('❌ .env still has placeholder SMTP values.');
  console.error('   Replace SMTP_USER and SMTP_PASS with your real Gmail App Password.\n');
  process.exit(1);
}

console.log(`✅ SMTP_USER found: ${SMTP_USER}`);
console.log(`✅ SMTP_PASS found: ${'*'.repeat(SMTP_PASS.length)}\n`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Step 2: Verify connection + authentication
console.log('⏳ Verifying Gmail SMTP connection & authentication…');
transporter.verify((err, success) => {
  if (err) {
    console.error('\n❌ SMTP verification FAILED');
    console.error(`   Error:  ${err.message}`);
    if (err.responseCode) console.error(`   Code:   ${err.responseCode}`);
    if (err.response)     console.error(`   Reply:  ${err.response}`);
    console.error('\n👉 Common fixes:');
    console.error('   • App Password must be generated at:');
    console.error('     Google Account → Security → 2-Step Verification → App Passwords');
    console.error('   • 2-Step Verification must be ENABLED on the Gmail account');
    console.error('   • Remove spaces from the App Password (paste as: xxxxxxxxxxxx)');
    console.error('   • The Gmail account must not be suspended or locked\n');
    process.exit(1);
  }

  console.log('✅ SMTP authentication successful — Gmail accepted the credentials\n');

  // Step 3: Send a real test email to the sender's own inbox
  console.log(`⏳ Sending test email to ${SMTP_USER}…`);
  transporter.sendMail(
    {
      from: `"SavePlate Test" <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: 'SavePlate SMTP Test — Delivery Confirmed ✅',
      text: 'This is a test email from the SavePlate SMTP diagnostic script. If you received this, your Gmail SMTP configuration is working correctly.',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#15803d;">SMTP Test Passed ✅</h2>
          <p>Your Gmail SMTP config for SavePlate is working correctly.</p>
          <p style="color:#6b7280;font-size:13px;">Sent via: <strong>${SMTP_USER}</strong></p>
          <p style="color:#9ca3af;font-size:12px;">SavePlate — Reduce Waste, Share More</p>
        </div>`,
    },
    (sendErr, info) => {
      if (sendErr) {
        console.error('\n❌ sendMail FAILED');
        console.error(`   Error: ${sendErr.message}`);
        if (sendErr.responseCode) console.error(`   Code:  ${sendErr.responseCode}`);
        if (sendErr.response)     console.error(`   Reply: ${sendErr.response}`);
        process.exit(1);
      }
      console.log(`✅ Test email sent! messageId: ${info.messageId}`);
      console.log(`\n🎉 All checks passed. Check the inbox of ${SMTP_USER}.`);
      console.log('   (If not in inbox, check the Spam/Junk folder.)\n');
      process.exit(0);
    }
  );
});
