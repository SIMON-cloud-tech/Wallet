const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  // 1. Get token from request header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find the user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    // 4. Pass to controller
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token expired' });
  }
};

module.exports = authMiddleware;