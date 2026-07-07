const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/profileController');

const profileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  
  body('tillNumber')
    .optional()
    .trim()
    .matches(/^\d{1,10}$/).withMessage('Till number must be 1-10 digits')
];

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, profileValidation, updateProfile);

module.exports = router;