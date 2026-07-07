// backend/controllers/dataManageController.js
const User = require('../models/User'); // <-- Add this
const Transaction = require('../models/Transaction');
const AllocationRule = require('../models/AllocationRule');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const getDumpPath = (userId) => path.join(DATA_DIR, 'dump', `dump_${userId}.json`);

// Helper to strip Mongo internal fields
const stripMongoFields = (doc) => {
  const { _id, __v, ...rest } = doc;
  return rest;
};

// ==================== 1. SOFT DELETE ====================
exports.softDelete = async (req, res) => {
  const userId = req.user._id;

  try {
    const transactions = await Transaction.find({ user: userId }).lean();
    const allocationRules = await AllocationRule.find({ user: userId }).lean();

    if (transactions.length === 0 && allocationRules.length === 0) {
      return res.status(400).json({ message: 'No financial data found to delete.' });
    }

    const backupData = {
      metadata: {
        userId: userId.toString(),
        timestamp: new Date().toISOString(),
        transactionCount: transactions.length,
        allocationRuleCount: allocationRules.length,
      },
      data: {
        transactions: transactions.map(stripMongoFields),
        allocationRules: allocationRules.map(stripMongoFields),
      },
    };

    await fs.mkdir(path.join(DATA_DIR, 'dump'), { recursive: true });
    await fs.writeFile(getDumpPath(userId), JSON.stringify(backupData, null, 2), 'utf8');

    await Transaction.deleteMany({ user: userId });
    await AllocationRule.deleteMany({ user: userId });

    res.status(200).json({
      message: `Soft delete successful. ${transactions.length} transactions and ${allocationRules.length} rules backed up.`,
    });
  } catch (error) {
    console.error('Soft delete error:', error);
    res.status(500).json({ message: 'Server error during soft delete.' });
  }
};

// ==================== 2. RESTORE ====================
exports.restore = async (req, res) => {
  const userId = req.user._id;
  const dumpPath = getDumpPath(userId);

  try {
    await fs.access(dumpPath);
    const fileContent = await fs.readFile(dumpPath, 'utf8');
    const backupData = JSON.parse(fileContent);
    const { transactions, allocationRules } = backupData.data;

    if (!transactions.length && !allocationRules.length) {
      await fs.unlink(dumpPath);
      return res.status(200).json({ message: 'Dump file was empty. Trash cleared.' });
    }

    let restoredTx = 0,
      restoredRules = 0;
    if (transactions.length > 0) {
      const txResult = await Transaction.insertMany(transactions, { ordered: false });
      restoredTx = txResult.length;
    }
    if (allocationRules.length > 0) {
      const ruleResult = await AllocationRule.insertMany(allocationRules, { ordered: false });
      restoredRules = ruleResult.length;
    }

    await fs.unlink(dumpPath);

    res.status(200).json({
      message: `Restore successful! ${restoredTx} transactions and ${restoredRules} rules restored.`,
    });
  } catch (error) {
    console.error('Restore error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Restore failed due to duplicate data (e.g., M-Pesa code already exists). Please clear current data first.',
      });
    }
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'No backup file found to restore.' });
    }
    res.status(500).json({ message: 'Server error during restore.' });
  }
};

// ==================== 3. EMPTY TRASH ====================
exports.emptyTrash = async (req, res) => {
  const userId = req.user._id;
  const dumpPath = getDumpPath(userId);

  try {
    await fs.access(dumpPath);
    await fs.unlink(dumpPath);
    res.status(200).json({ message: 'Trash emptied permanently. Backup file deleted.' });
  } catch {
    res.status(404).json({ message: 'No backup file found to delete.' });
  }
};

// ==================== 4. GENERATE REPORT (HTML + Auto-Print) ====================
// ==================== 4. GENERATE REPORT (HTML + Save CSV) ====================
exports.generateReport = async (req, res) => {
  const userId = req.user._id;
  const dumpPath = getDumpPath(userId);
  const reportsDir = path.join(__dirname, '..', 'data', 'reports');

  try {
    // 1. Get user details for the report header
    const user = await User.findById(userId).select('fullName email tillNumber');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Check if dump exists
    await fs.access(dumpPath);
    const fileContent = await fs.readFile(dumpPath, 'utf8');
    const backupData = JSON.parse(fileContent);
    const { transactions } = backupData.data;

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({ message: 'No dumped data found to generate a report.' });
    }

    // 3. Sort: newest first (descending timestamp)
    const sortedTxs = [...transactions].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // 4. Format helpers
    const formatCurrency = (amount) => `KSH. ${Number(amount).toLocaleString()}`;
    const formatDate = (date) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    };

    // 5. Ensure reports directory exists
    await fs.mkdir(reportsDir, { recursive: true });

    // 6. Generate CSV content (flattened allocations)
    const csvHeaders = ['Received', 'Date & Time', 'Allocation', 'Amount'];
    const csvRows = [];
    let totalAmount = 0;

    sortedTxs.forEach((tx) => {
      const allocations = tx.allocations || [];
      const txAmount = tx.amount || 0;
      totalAmount += txAmount;

      if (allocations.length === 0) {
        csvRows.push([
          formatCurrency(txAmount),
          formatDate(tx.timestamp),
          'No allocation',
          formatCurrency(txAmount),
        ]);
      } else {
        allocations.forEach((alloc, index) => {
          const allocAmount = alloc.amount || 0;
          csvRows.push([
            index === 0 ? formatCurrency(txAmount) : '',
            index === 0 ? formatDate(tx.timestamp) : '',
            alloc.name || 'Unnamed',
            formatCurrency(allocAmount),
          ]);
        });
      }
    });

    // Add total row
    csvRows.push(['', '', 'TOTAL', formatCurrency(totalAmount)]);

    // Build CSV string
    const csvContent = [
      // Add report metadata as comments at the top
      `# Client: ${user.fullName}`,
      `# Email: ${user.email}`,
      `# Till Number: ${user.tillNumber || 'N/A'}`,
      `# Report Generated: ${new Date().toLocaleString()}`,
      `# Backup Date: ${new Date(backupData.metadata.timestamp).toLocaleString()}`,
      `# Total Transactions: ${sortedTxs.length}`,
      '',
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      '',
      `# Total Amount: ${formatCurrency(totalAmount)}`,
    ].join('\n');

    // 7. Save CSV to file with unique ID (timestamp)
    const timestamp = Date.now();
    const filename = `report_${userId}_${timestamp}.csv`;
    const filePath = path.join(reportsDir, filename);
    await fs.writeFile(filePath, csvContent, 'utf8');

    console.log(`📊 Report saved: ${filename}`);

    // 8. Build HTML report (with client details + download link)
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Build table rows for HTML
    let tableRows = '';
    sortedTxs.forEach((tx) => {
      const allocations = tx.allocations || [];
      const txAmount = tx.amount || 0;

      if (allocations.length === 0) {
        tableRows += `
          <tr>
            <td>${formatCurrency(txAmount)}</td>
            <td>${formatDate(tx.timestamp)}</td>
            <td><em>No allocation</em></td>
            <td>${formatCurrency(txAmount)}</td>
          </tr>
        `;
      } else {
        allocations.forEach((alloc, index) => {
          const allocAmount = alloc.amount || 0;
          tableRows += `
            <tr>
              ${index === 0 ? `<td>${formatCurrency(txAmount)}</td><td>${formatDate(tx.timestamp)}</td>` : '<td></td><td></td>'}
              <td>${alloc.name || 'Unnamed'}</td>
              <td>${formatCurrency(allocAmount)}</td>
            </tr>
          `;
        });
      }
    });

    // HTML Report
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Financial Report - ${user.fullName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f4f4f4;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
        }
        .report-container {
          max-width: 1100px;
          width: 100%;
          background: #ffffff;
          padding: 40px 50px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .report-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 3px solid #2c3e50;
          padding-bottom: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .report-header .logo {
          flex: 0 0 auto;
        }
        .report-header .logo img {
          max-height: 70px;
          width: auto;
        }
        .report-header .company-details {
          text-align: left;
          flex: 1;
          padding: 0 20px;
        }
        .report-header .company-details h1 {
          font-size: 1.8rem;
          color: #2c3e50;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .report-header .company-details p {
          font-size: 1rem;
          color: #555;
          margin: 2px 0;
        }
        .report-header .company-details .client-info {
          font-size: 0.9rem;
          color: #666;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #ccc;
        }
        .report-header .report-meta {
          text-align: right;
          font-size: 0.85rem;
          color: #666;
          white-space: nowrap;
        }
        .report-header .report-meta strong {
          color: #2c3e50;
        }
        .report-title {
          text-align: center;
          font-size: 1.6rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 15px 0 25px 0;
        }
        .table-wrapper {
          overflow-x: auto;
          margin: 20px 0 30px 0;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
        table thead {
          background: #2c3e50;
          color: #ffffff;
        }
        table thead th {
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        table tbody tr {
          border-bottom: 1px solid #eaeaea;
        }
        table tbody tr:last-child {
          border-bottom: none;
        }
        table tbody td {
          padding: 10px 15px;
          vertical-align: top;
          color: #333;
        }
        table tbody tr:hover {
          background: #f8f9fa;
        }
        .total-row {
          background: #f8f9fa !important;
          font-weight: 700;
          border-top: 2px solid #2c3e50;
        }
        .total-row td {
          padding: 12px 15px;
        }
        .report-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 25px;
          border-top: 1px solid #ddd;
          padding-top: 25px;
        }
        .report-actions button {
          padding: 10px 28px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .report-actions button:hover {
          transform: scale(1.02);
        }
        .btn-print { background: #2c3e50; }
        .btn-print:hover { background: #1a252f; }
        .btn-csv { background: #5cb85c; }
        .btn-csv:hover { background: #449d44; }
        .footer-note {
          text-align: center;
          font-size: 0.8rem;
          color: #999;
          margin-top: 20px;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        .saved-notice {
          text-align: center;
          font-size: 0.9rem;
          color: #5cb85c;
          margin-top: 10px;
          padding: 8px;
          background: #dff0d8;
          border-radius: 4px;
        }
        @media print {
          body { background: #fff; padding: 0; }
          .report-container { box-shadow: none; border-radius: 0; padding: 30px 40px; }
          .report-actions { display: none; }
          .saved-notice { display: none; }
          .table-wrapper { border: 1px solid #ccc; }
          table thead { background: #2c3e50 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-header { border-bottom-color: #000; }
          .total-row { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="report-container" id="reportContainer">
        <div class="report-header">
          <div class="logo">
            <img src="${baseUrl}/logo.png" alt="Company Logo" onerror="this.style.display='none'" />
          </div>
          <div class="company-details">
            <h1>Prestige Web Room Wallet</h1>
            <p>P.O BOX 1252-00100</P>
            <p>Imara Daima, Nairobi, Kenya</p>
            <div class="client-info">
              <strong>Client:</strong> ${user.fullName} &nbsp;|&nbsp;
              <strong>Email:</strong> ${user.email} &nbsp;|&nbsp;
              <strong>Till:</strong> ${user.tillNumber || 'N/A'}
            </div>
          </div>
          <div class="report-meta">
            <strong>Report:</strong> ${new Date().toLocaleString()}<br>
            <strong>Backup:</strong> ${new Date(backupData.metadata.timestamp).toLocaleString()}<br>
            <strong>Transactions:</strong> ${sortedTxs.length}
          </div>
        </div>

        <div class="report-title">📊 FINANCIAL TRANSACTION STATEMENT</div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Received</th>
                <th>Date &amp; Time</th>
                <th>Allocation</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">TOTAL</td>
                <td>${formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      <div class="saved-notice" style="
        text-align: center; 
        font-size: 0.95rem; 
        color: #3c763d; 
        margin-top: 10px; 
        padding: 10px 15px; 
        background: #dff0d8; 
        border-radius: 4px;
       ">
          ✅ Report saved to Prestige Web Room Database
          <div style="font-size: 0.8rem; color: #666; margin-top: 4px;">
          Reference: ${filename}
      </div>
          </div>

        <div class="report-actions">
          <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="btn-csv" onclick="downloadCSV()">📥 Download CSV</button>
        </div>

        <div class="footer-note">
          &copy; ${new Date().getFullYear()} Prestige Web Room Financial services. All rights reserved.
        </div>
      </div>

      <script>
        function downloadCSV() {
          const rows = document.querySelectorAll('table tbody tr');
          let csv = 'Received,Date & Time,Allocation,Amount\\n';
          rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            const rowData = [];
            cols.forEach(col => {
              let text = col.innerText.trim();
              rowData.push('"' + text.replace(/"/g, '""') + '"');
            });
            csv += rowData.join(',') + '\\n';
          });
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', '${filename}');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        };
      </script>
    </body>
    </html>
    `;

    // 9. Send HTML back to the browser
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Report generation error:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        message: 'No backup file found. Please run "Soft Delete" first to generate a dump.',
      });
    }
    res.status(500).json({ message: 'Server error while generating report.' });
  }
};