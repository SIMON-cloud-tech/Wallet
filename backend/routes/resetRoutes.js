const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { sendOTP, verifyOTP, resetPassword } = require('../controllers/resetController');

const emailValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail()
];

const otpValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .matches(/^\d{6}$/).withMessage('OTP must be numbers only')
];

const passwordValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('otp')
    .trim()
    .matches(/^\d{6}$/).withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
];

// Rate limit these routes heavily
router.post('/send-otp', emailValidation, sendOTP);
router.post('/verify-otp', otpValidation, verifyOTP);
router.post('/reset-password', passwordValidation, resetPassword);

module.exports = router;