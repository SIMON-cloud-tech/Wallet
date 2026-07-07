const Transaction = require('../models/Transaction');

const getRevenue = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .select('mpesaCode amount senderName timestamp allocations')
      .lean();

    // Aggregate allocations across all transactions
    const allocationMap = {};
    let totalAmount = 0;

    transactions.forEach(txn => {
      totalAmount += txn.amount;
      txn.allocations.forEach(allocation => {
        if (allocationMap[allocation.name]) {
          allocationMap[allocation.name].amount += allocation.amount;
        } else {
          allocationMap[allocation.name] = {
            name: allocation.name,
            amount: allocation.amount,
            percentage: 0
          };
        }
      });
    });

    const allocations = Object.values(allocationMap).map(a => ({
      ...a,
      percentage: totalAmount > 0 ? Math.round((a.amount / totalAmount) * 100) : 0
    }));

    res.json({ transactions, allocations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRevenue };