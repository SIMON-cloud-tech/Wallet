const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { getAllocations, addAllocation, deleteAllocation, reapplyAllocations } = require('../controllers/allocationController');

// Validation rules
const allocationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Allocation name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Name must be 2-30 characters')
    .matches(/^[a-zA-Z0-9\s]+$/).withMessage('Name can only contain letters and numbers'),
  
  body('percentage')
    .isInt({ min: 1, max: 100 }).withMessage('Percentage must be 1-100'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Reason must be under 100 characters')
    .matches(/^[a-zA-Z0-9\s.,!?-]+$/).withMessage('Reason contains invalid characters')
];

router.get('/', authMiddleware, getAllocations);
router.post('/', authMiddleware, allocationValidation, addAllocation);
router.delete('/:id', authMiddleware, deleteAllocation);
router.post('/reapply', authMiddleware, reapplyAllocations);

module.exports = router;