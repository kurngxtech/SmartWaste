const nodemailer = require('nodemailer');

// A simple simulated email sender for MVP purposes
// If actual SMTP credentials are provided in .env, it uses those.
// Otherwise, it uses a mock account (Ethereal Email) or simply logs to console.
const sendVerificationEmail = async (email, code) => {
  try {
    // For MVP/Mentorship timeline, we can just log the code to the console
    // so the tester/dev can use it without needing real SMTP credentials.
    console.log(`\n=============================================`);
    console.log(`📧 MOCK EMAIL SENT TO: ${email}`);
    console.log(`🔐 VERIFICATION CODE: ${code}`);
    console.log(`=============================================\n`);

    // Only attempt real email if SMTP_USER is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: '"SavePlate Support" <no-reply@saveplate.com>',
        to: email,
        subject: "SavePlate - Verify Your Email",
        text: `Welcome to SavePlate! Your verification code is: ${code}\nThis code expires in 15 minutes.`,
        html: `<p>Welcome to SavePlate!</p><p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 15 minutes.</p>`
      });
      console.log(`[EmailService] Verification email actually sent to ${email}`);
    }
  } catch (error) {
    console.error(`[EmailService] Failed to send verification email:`, error);
  }
};

module.exports = {
  sendVerificationEmail
};
