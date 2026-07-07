// backend/routes/dataManageRoutes.js
const express = require('express');
const router = express.Router();
const {
  softDelete,
  restore,
  emptyTrash,
  generateReport,
} = require('../controllers/dataManageController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected by auth
router.post('/soft-delete', authMiddleware, softDelete);
router.post('/restore', authMiddleware, restore);
router.post('/empty-trash', authMiddleware, emptyTrash);
router.post('/generate-report', authMiddleware, generateReport);

module.exports = router;