const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index: speeds up queries like "find all transactions for user X"
  },
  mpesaCode: {
    type: String,
    required: true,
    unique: true, // Index: MongoDB auto-creates unique index, prevents duplicates instantly
    index: true // Double ensures fast lookup by M-Pesa code
  },
  amount: {
    type: Number,
    required: true
  },
  senderName: {
    type: String,
    default: 'Unknown'
  },
  senderPhone: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Index: speeds up sorting by date, "last 10 transactions"
  },
  allocations: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    }
  }]
}, { 
  timestamps: true // Auto adds createdAt and updatedAt
});

// Compound index: "get user's transactions sorted by newest" - covers 90% of queries
// MongoDB uses this single index instead of scanning entire collection
transactionSchema.index({ user: 1, timestamp: -1 });

// Compound index: "find transaction by user AND mpesaCode" - instant lookup
// Prevents duplicate M-Pesa codes per user in one query
transactionSchema.index({ user: 1, mpesaCode: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', transactionSchema);