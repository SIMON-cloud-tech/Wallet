const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

// Analytics is read-only, no input validation needed
// Auth middleware protects the route
router.get('/', authMiddleware, getAnalytics);

module.exports = router;