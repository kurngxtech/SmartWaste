const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------------
// Startup guard: warn immediately if SMTP is not configured
// ---------------------------------------------------------------------------
const _smtpUser = process.env.SMTP_USER;
const _smtpPass = process.env.SMTP_PASS;

if (!_smtpUser || !_smtpPass ||
    _smtpUser === 'your_gmail@gmail.com' ||
    _smtpPass === 'your_16_char_app_password') {
  console.warn('\n[EmailService] ⚠️  SMTP credentials are missing or still using placeholder values!');
  console.warn('[EmailService]    Set SMTP_USER and SMTP_PASS (Gmail App Password) in .env');
  console.warn('[EmailService]    Emails will FAIL until real credentials are provided.\n');
}

/**
 * Gmail SMTP rule: the `from` address MUST match the authenticated account.
 * Using a custom domain like "no-reply@saveplate.com" causes a 553/550 sender
 * rejection. Always send FROM the actual Gmail address.
 */
const FROM_ADDRESS = `"SavePlate" <${_smtpUser}>`;

/**
 * Singleton transporter — created once and reused for all sends.
 *
 * WHY: Calling transporter.verify() on every email opens a fresh TCP socket
 * to Gmail's SMTP servers. Gmail rate-limits rapid successive SMTP connection
 * handshakes, causing intermittent auth failures (ETIMEDOUT / 535) even when
 * credentials are perfectly valid. A singleton avoids this by keeping one
 * persistent authenticated session.
 */
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    service: 'gmail',        // nodemailer preset: smtp.gmail.com:587, STARTTLS
    auth: {
      user: _smtpUser,
      pass: _smtpPass,       // 16-char Gmail App Password (spaces OK)
    },
    pool: true,              // keep SMTP connection alive between sends
    maxConnections: 3,       // allow up to 3 concurrent sends
    rateDelta: 1000,         // spread sends 1 s apart if pool is saturated
    rateLimit: 5,            // max 5 messages per rateDelta window
  });

  console.log('[EmailService] ✅ SMTP transporter initialised (pooled, singleton)');
  return _transporter;
};

// ---------------------------------------------------------------------------
// 1. Signup / Email Verification OTP  (15 min expiry)
// ---------------------------------------------------------------------------
const sendVerificationEmail = async (email, code) => {
  console.log(`[EmailService] Sending signup OTP to ${email}…`);
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: 'SavePlate — Verify Your Email',
      text: `Your SavePlate verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#15803d;margin-bottom:8px;">Welcome to SavePlate! 🌿</h2>
          <p style="color:#374151;font-size:15px;">Use the code below to verify your email address:</p>
          <div style="text-align:center;margin:28px 0;">
            <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:10px;color:#15803d;background:#dcfce7;padding:16px 28px;border-radius:10px;">${code}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;">This code expires in <strong>15 minutes</strong>.</p>
          <p style="color:#6b7280;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>
          <hr style="margin:24px 0;border-color:#e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">SavePlate — Reduce Waste, Share More</p>
        </div>`,
    });
    console.log(`[EmailService] ✅ Signup OTP delivered to ${email} (messageId: ${info.messageId})`);
  } catch (error) {
    _transporter = null; // reset singleton so next call gets a fresh connection
    console.error(`[EmailService] ❌ Failed to send signup OTP to ${email}`);
    console.error(`[EmailService]    SMTP Error: ${error.message}`);
    if (error.responseCode) console.error(`[EmailService]    SMTP Code:  ${error.responseCode}`);
    if (error.response)     console.error(`[EmailService]    SMTP Reply: ${error.response}`);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 2. Login 2FA OTP  (10 min expiry)
// ---------------------------------------------------------------------------
const send2FAEmail = async (email, code) => {
  console.log(`[EmailService] Sending 2FA OTP to ${email}…`);
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: 'SavePlate — Two-Factor Authentication Code',
      text: `Your SavePlate 2FA code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not attempt to log in, please change your password immediately.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#15803d;margin-bottom:8px;">Login Verification 🔐</h2>
          <p style="color:#374151;font-size:15px;">Your two-factor authentication code for SavePlate:</p>
          <div style="text-align:center;margin:28px 0;">
            <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:10px;color:#15803d;background:#dcfce7;padding:16px 28px;border-radius:10px;">${code}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color:#dc2626;font-size:13px;">If you did not attempt to log in, please change your password immediately.</p>
          <hr style="margin:24px 0;border-color:#e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">SavePlate — Reduce Waste, Share More</p>
        </div>`,
    });
    console.log(`[EmailService] ✅ 2FA OTP delivered to ${email} (messageId: ${info.messageId})`);
  } catch (error) {
    _transporter = null;
    console.error(`[EmailService] ❌ Failed to send 2FA OTP to ${email}`);
    console.error(`[EmailService]    SMTP Error: ${error.message}`);
    if (error.responseCode) console.error(`[EmailService]    SMTP Code:  ${error.responseCode}`);
    if (error.response)     console.error(`[EmailService]    SMTP Reply: ${error.response}`);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// 3. Password Reset Link  (1 hour expiry)
// ---------------------------------------------------------------------------
const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`[EmailService] Sending password reset link to ${email}…`);
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: 'SavePlate — Password Reset Request',
      text: `You requested a password reset.\n\nClick the link below to reset your password (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, please ignore this email. Your password will not change.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#15803d;margin-bottom:8px;">Password Reset Request 🔑</h2>
          <p style="color:#374151;font-size:15px;">We received a request to reset your SavePlate password. Click the button below to choose a new one:</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:#15803d;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">Reset My Password</a>
          </div>
          <p style="color:#6b7280;font-size:13px;">This link expires in <strong>1 hour</strong>. If it has expired, request a new reset from the app.</p>
          <p style="color:#6b7280;font-size:13px;">If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>
          <hr style="margin:24px 0;border-color:#e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">SavePlate — Reduce Waste, Share More</p>
        </div>`,
    });
    console.log(`[EmailService] ✅ Reset link delivered to ${email} (messageId: ${info.messageId})`);
  } catch (error) {
    _transporter = null;
    console.error(`[EmailService] ❌ Failed to send password reset email to ${email}`);
    console.error(`[EmailService]    SMTP Error: ${error.message}`);
    if (error.responseCode) console.error(`[EmailService]    SMTP Code:  ${error.responseCode}`);
    if (error.response)     console.error(`[EmailService]    SMTP Reply: ${error.response}`);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  send2FAEmail,
  sendPasswordResetEmail,
};
