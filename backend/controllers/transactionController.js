const Transaction = require('../models/Transaction');

const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(4)
      .select('amount senderName mpesaCode timestamp')
      .lean();

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      transactions,
      stats: [
        { label: 'Total Received', value: `$${totalAmount.toLocaleString()}` },
        { label: 'Transactions', value: transactions.length.toString() },
        { label: 'Latest', value: transactions[0]?.amount ? `$${transactions[0].amount.toLocaleString()}` : '$0' }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    if (!transactions.length) {
      return res.json({ notifications: [] });
    }

    const notifications = [];

    transactions.forEach(txn => {
      notifications.push({
        id: `received-${txn._id}`,
        message: `KSH ${txn.amount.toLocaleString()} received from ${txn.senderName || txn.senderPhone || 'Mpesa Customer'} - M-Pesa: ${txn.mpesaCode}`,
        type: 'success',
        timestamp: txn.timestamp
      });

      txn.allocations.forEach(allocation => {
        notifications.push({
          id: `alloc-${txn._id}-${allocation.name}`,
          message: `${allocation.name} allocated ${allocation.percentage}% (KSH ${allocation.amount.toLocaleString()}) from KSH ${txn.amount.toLocaleString()}`,
          type: 'info',
          timestamp: txn.timestamp
        });
      });
    });

    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRecentTransactions, getNotifications };