const mongoose = require('mongoose');

const allocationRuleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  reason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Prevent duplicate allocation names per user
allocationRuleSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('AllocationRule', allocationRuleSchema);