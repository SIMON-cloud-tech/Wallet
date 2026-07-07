const AllocationRule = require('../models/AllocationRule');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Get user's allocation rules + calculated amounts from transactions
const getAllocations = async (req, res) => {
  try {
    const rules = await AllocationRule.find({ user: req.user._id }).lean();
    const transactions = await Transaction.find({ 
      user: req.user._id,
      amount: { $gt: 0 }
    }).lean();

    const allocationMap = {};
    
    rules.forEach(rule => {
      allocationMap[rule.name] = {
        id: rule._id,
        name: rule.name,
        percentage: rule.percentage,
        amount: 0,
        reason: rule.reason || ''
      };
    });

    transactions.forEach(transaction => {
      transaction.allocations.forEach(allocation => {
        if (allocationMap[allocation.name]) {
          allocationMap[allocation.name].amount += allocation.amount;
        }
      });
    });

    const allocations = Object.values(allocationMap);
    allocations.sort((a, b) => b.amount - a.amount);

    res.json({ allocations });
  } catch (error) {
    console.error('Get allocations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new allocation rule
const addAllocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, percentage, reason } = req.body;

    // Check if rule already exists for this user
    const exists = await AllocationRule.findOne({ 
      user: req.user._id, 
      name: name.toLowerCase() 
    });
    
    if (exists) {
      return res.status(400).json({ message: 'Allocation with this name already exists' });
    }

    // ✅ Validate 100% limit
    const existingRules = await AllocationRule.find({ user: req.user._id });
    const currentTotal = existingRules.reduce((sum, rule) => sum + rule.percentage, 0);
    const newTotal = currentTotal + Number(percentage);

    if (newTotal > 100) {
      return res.status(400).json({
        message: `Total allocation percentage cannot exceed 100%. Current: ${currentTotal}%, you tried to add ${percentage}%.`
      });
    }

    const rule = await AllocationRule.create({
      user: req.user._id,
      name,
      percentage: Number(percentage),
      reason: reason || ''
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Add allocation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an allocation rule
const deleteAllocation = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid allocation ID' });
    }

    const rule = await AllocationRule.findOneAndDelete({ 
      _id: req.params.id,
      user: req.user._id 
    });

    if (!rule) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    res.json({ message: 'Allocation deleted' });
  } catch (error) {
    console.error('Delete allocation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const reapplyAllocations = async (req, res) => {
  try {
    const rules = await AllocationRule.find({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id });
    let updatedCount = 0;

    if (rules.length === 0) {
      // No rules – clear all allocations from transactions
      for (const txn of transactions) {
        if (txn.allocations.length > 0) {
          await Transaction.updateOne({ _id: txn._id }, { allocations: [] });
          updatedCount++;
        }
      }
      return res.json({ 
        message: `All allocations cleared from ${updatedCount} transactions.`,
        updatedCount 
      });
    }

    // Normal reapply with rules
    for (const txn of transactions) {
      const allocations = rules.map(rule => ({
        name: rule.name,
        amount: Math.round((txn.amount * rule.percentage) / 100),
        percentage: rule.percentage
      }));

      await Transaction.updateOne({ _id: txn._id }, { allocations });
      updatedCount++;
    }

    res.json({ message: 'Allocations re-applied successfully', updatedCount });
  } catch (error) {
    console.error('Reapply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllocations, addAllocation, deleteAllocation, reapplyAllocations };