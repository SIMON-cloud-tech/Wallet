const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getRevenue } = require('../controllers/revenueController');

router.get('/', authMiddleware, getRevenue);

module.exports = router;