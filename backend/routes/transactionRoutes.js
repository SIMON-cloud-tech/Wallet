const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getRecentTransactions, getNotifications } = require('../controllers/transactionController');

router.get('/recent', authMiddleware, getRecentTransactions);
router.get('/notifications', authMiddleware, getNotifications);

module.exports = router;