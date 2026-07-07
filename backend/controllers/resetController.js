const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
//const { sendOTPEmail } = require('../utils/sendEmail');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Step 1: Send OTP
const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = generateOTP();

    // EDITED: Use updateOne instead of save() to skip pre-save hook
    await User.updateOne(
      { _id: user._id },
      { 
        resetOTP: otp, 
        resetOTPExpires: Date.now() + 5 * 60 * 1000 
      }
    );

    // 📧 EMAIL IS SENT HERE
   // await sendOTPEmail(email, otp);

    console.log('========================================');
    console.log(`OTP for ${email}: ${otp}`);
    console.log('========================================');
    
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 2: Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 3: Reset password
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // EDITED: Hash password manually and use updateOne to skip pre-save hook
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: user._id },
      { 
        password: hashedPassword,
        resetOTP: null, 
        resetOTPExpires: null 
      }
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendOTP, verifyOTP, resetPassword };