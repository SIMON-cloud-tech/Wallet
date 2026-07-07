const Transaction = require('../models/Transaction');

const getAnalytics = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .lean();

    // Build allocation aggregations
    const allocationMap = {};
    let totalAmount = 0;

    transactions.forEach(txn => {
      totalAmount += txn.amount;
      txn.allocations.forEach(allocation => {
        if (allocationMap[allocation.name]) {
          allocationMap[allocation.name].amount += allocation.amount;
          allocationMap[allocation.name].count += 1;
        } else {
          allocationMap[allocation.name] = {
            name: allocation.name,
            amount: allocation.amount,
            count: 1,
            percentage: 0
          };
        }
      });
    });

    // Calculate percentages
    const pieChart = Object.values(allocationMap).map(a => ({
      name: a.name,
      percentage: totalAmount > 0 ? Math.round((a.amount / totalAmount) * 100) : 0
    }));

    // Bar graph data
    const barGraph = Object.values(allocationMap).map(a => ({
      name: a.name,
      amount: a.amount
    }));

    // Line graph data
    const lineGraph = transactions.slice(0, 10).map(txn => ({
      receivable: `$${txn.amount}`,
      allocations: txn.allocations.length
    })).reverse();

    // Most funded
    const sorted = [...pieChart].sort((a, b) => b.percentage - a.percentage);
    const mostFunded = sorted[0] ? {
      name: sorted[0].name,
      reason: `received ${sorted[0].percentage}% of total monthly allocations`
    } : null;

    // Pyramids data
    const pyramids = transactions.map(txn => ({
      _id: txn._id,
      timestamp: txn.timestamp,
      allocations: txn.allocations.map(a => ({
        name: a.name,
        percentage: a.percentage
      }))
    }));

    res.json({
      transactions,
      pyramids,
      graphs: { lineGraph, pieChart, barGraph },
      mostFunded
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAnalytics };