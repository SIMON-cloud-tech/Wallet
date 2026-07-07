const User = require('../models/User');
const { validationResult } = require('express-validator');
const sharp = require('sharp');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { fullName, email, tillNumber, avatar } = req.body;

    let processedAvatar = avatar;

    // Process image server-side
    if (avatar && avatar.startsWith('data:image/')) {
      try {
        const base64Data = avatar.split(';base64,').pop();
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length > 5 * 1024 * 1024) {
          return res.status(400).json({ message: 'Image too large. Maximum 5MB' });
        }

        const processed = await sharp(buffer)
          .resize(300, 300, { fit: 'cover' })
          .webp({ quality: 60 })
          .toBuffer();

        processedAvatar = `data:image/webp;base64,${processed.toString('base64')}`;
        
        console.log(`Image: ${(buffer.length / 1024).toFixed(1)}KB → ${(processed.length / 1024).toFixed(1)}KB`);
      } catch (imgError) {
        console.error('Image processing failed:', imgError);
        return res.status(400).json({ message: 'Failed to process image' });
      }
    }

    // Input sanitization
    if (tillNumber && !/^\d{1,10}$/.test(tillNumber)) {
      return res.status(400).json({ message: 'Invalid till number' });
    }

    if (fullName && !/^[a-zA-Z\s]{2,50}$/.test(fullName)) {
      return res.status(400).json({ message: 'Name must be 2-50 letters only' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Get current user data
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Build update object
    const updateData = {
      fullName: fullName ? fullName.trim() : user.fullName,
      email: email ? email.toLowerCase().trim() : user.email,
      tillNumber: tillNumber ? tillNumber.trim() : user.tillNumber
    };

    // Only update avatar if processed
    if (processedAvatar && processedAvatar.startsWith('data:image/')) {
      updateData.avatar = processedAvatar;
    }

    // Use updateOne to skip pre-save hook
    await User.updateOne({ _id: req.user._id }, updateData);

    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };