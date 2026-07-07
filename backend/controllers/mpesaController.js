const { sendEmail } = require('../utils/sendEmail');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AllocationRule = require('../models/AllocationRule');

const mpesaCallback = async (req, res) => {
  try {
    const callback = req.body.Body.stkCallback;
    
    if (callback.ResultCode !== 0) {
      return res.json({ ResultCode: 1, ResultDesc: "Failed" });
    }

    const items = callback.CallbackMetadata.Item;
    //extract all the items data from the daraja webhook callback
    const amount = items.find(i => i.Name === "Amount")?.Value;
    const mpesaCode = items.find(i => i.Name === "MpesaReceiptNumber")?.Value;
    const phone = items.find(i => i.Name === "PhoneNumber")?.Value;
    const tillNumber = items.find(i => i.Name === "BusinessShortCode")?.Value;

    // Find user by till number
    const user = await User.findOne({ tillNumber: tillNumber.toString() });
    if (!user) {
      console.log(`No user for till: ${tillNumber}`);
      return res.json({ ResultCode: 0, ResultDesc: "No user found" });
    }

    // Check duplicate to avoid creating the same transaction twice
    const exists = await Transaction.findOne({ mpesaCode });
    if (exists) {
      return res.json({ ResultCode: 0, ResultDesc: "Duplicate" });
    }

    // Get user's allocation rules
    const rules = await AllocationRule.find({ user: user._id });

    // Calculate allocations based on rules
    const allocations = rules.map(rule => ({
      name: rule.name,
      amount: Math.round((amount * rule.percentage) / 100),
      percentage: rule.percentage
    }));

    // Create transaction with pre-filled allocations
    await Transaction.create({
      user: user._id,
      mpesaCode,
      amount,
      senderPhone: phone,
      timestamp: new Date(),
      allocations // Auto-filled from user's rules
    });

    // --- Notify the business owner via email ---
    const ownerEmail = user.email;
    console.log('Attempting to send email to:', ownerEmail);
    const subject = `New M‑Pesa Payment: KSH ${amount.toLocaleString()}`;
    const htmlBody = `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

    <!-- ====== HEADER with logo + company name/address ====== -->
    <div style="background-color: #2c3e50; padding: 16px 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <!-- Logo top‑left -->
          <td style="width: 60px; vertical-align: middle;">
            <img src="https://wallet.onrender.com/logo.png"
                 alt="Logo"
                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff;" />
          </td>

          <!-- Company name + address (top‑right, close to center) -->
          <td style="text-align: right; vertical-align: middle; padding-left: 16px;">
            <h2 style="color: #ffffff; margin: 0 0 4px 0; font-size: 18px; font-weight: 700;">
              Prestige Web Room
            </h2>
            <p style="color: #bdc3c7; margin: 0; font-size: 11px; line-height: 1.3;">
              Financial Wallet<br>
              P.O. Box 12345‑00100<br>
              Imara Daima, Nairobi
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- ====== BODY ====== -->
    <div style="padding: 24px; background-color: #ffffff;">
      <!-- Natural greeting -->
      <p style="margin: 0 0 8px 0; color: #333333; font-size: 16px;">
        Hello 👋,
      </p>
      <p style="margin: 0 0 16px 0; color: #333333; font-size: 16px;">
        Good news! Your M‑Pesa till just received a payment. Here are the details:
      </p>

      <!-- Transaction Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #666666; font-size: 14px; font-weight: bold;">Amount</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #27ae60; font-size: 20px; font-weight: bold; text-align: right;">KSH ${amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #666666; font-size: 14px; font-weight: bold;">From</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333333; font-size: 14px; text-align: right;">${phone || 'Mpesa Customer'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #666666; font-size: 14px; font-weight: bold;">M‑Pesa Code</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333333; font-size: 14px; text-align: right;">${mpesaCode}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; color: #666666; font-size: 14px; font-weight: bold;">Time</td>
          <td style="padding: 10px 12px; color: #333333; font-size: 14px; text-align: right;">${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <p style="margin: 0 0 16px 0; color: #333333; font-size: 15px;">
        Tap the button below to view your dashboard and see all your transactions.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 24px 0 8px 0;">
        <a href="https://wallet.onrender.com" 
           style="display: inline-block; padding: 12px 30px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
           Open Dashboard
        </a>
      </div>

      <p style="margin: 24px 0 0 0; font-size: 13px; color: #999999;">
        If you have any questions, just reply to this email – we’re happy to help.
      </p>
    </div>

    <!-- ====== FOOTER ====== -->
    <div style="background-color: #f8f9fa; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 12px; color: #999999;">
        This is an automated message from <strong>Prestige Web Room Financial Wallet</strong>. Please do not reply to this email.
      </p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #999999;">
        © ${new Date().getFullYear()} Prestige Web Room. All rights reserved.
      </p>
    </div>

  </div>
`;
    // Fire-and-forget – don’t let email failure block the callback
    sendEmail(ownerEmail, subject, htmlBody)
      .catch(err => console.error('Failed to send payment notification:', err));

    console.log(`Payment: KSH ${amount} from ${phone} to till ${tillNumber}. Allocations: ${allocations.length} rules applied`);
    res.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error('M-Pesa error:', error);
    res.json({ ResultCode: 1, ResultDesc: "Error" });
  }
};

module.exports = { mpesaCallback };