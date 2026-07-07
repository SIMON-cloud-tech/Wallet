const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'simonmbithi143@gmail.com';
const FROM_NAME = 'Prestige Web Room Financial Wallet';

/**
 * Send a generic email using the Brevo REST API.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 */
const sendEmail = async (to, subject, html) => {
  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Send an OTP email using the Brevo REST API.
 * @param {string} email - Recipient address
 * @param {string} otp  - The OTP code
 */
const sendOTPEmail = async (email, otp) => {
  console.log('========================================');
  console.log(`OTP for ${email}: ${otp}`);
  console.log('========================================');

  const html = `
    <div style="font-family: Arial; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #3498db;">FintechApp</h2>
      <p>You requested a password reset.</p>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing: 8px; background: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px;">
        ${otp}
      </h1>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, ignore this email.</p>
    </div>
  `;
  await sendEmail(email, 'FintechApp - Password Reset OTP', html);
};

module.exports = { sendEmail, sendOTPEmail };