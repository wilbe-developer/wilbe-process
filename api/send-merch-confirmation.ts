
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'jesse@wilbe.com',
    pass: process.env.GMAIL_APP_PASSWORD, // Google App Password
  },
});

// HTML email template
const createEmailHtml = (name: string, product: string, size: string, address: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1a365d;">Your Wilbe Merch Order Confirmation</h2>
    <p>Dear ${name},</p>
    <p>Thank you for ordering Wilbe merch! We're excited to get your item to you.</p>
    <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Order Details:</h3>
      <p><strong>Item:</strong> ${product}</p>
      <p><strong>Size:</strong> ${size}</p>
      <p><strong>Shipping Address:</strong><br/>${address}</p>
    </div>
    <p>We'll send you tracking information once your order ships.</p>
    <p>Best regards,<br/>The Wilbe Team</p>
  </div>
</body>
</html>
`;

// Slack message formatter
const createSlackMessage = (name: string, product: string, size: string, address: string) => ({
  text: `🎉 New merch order from ${name} for a ${product} (${size}). Shipping to: ${address}`,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, product, size, address } = req.body;

    // Validate required fields
    if (!name || !email || !product || !size || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send confirmation email
    await transporter.sendMail({
      from: '"Wilbe Team" <team@wilbe.com>',
      to: email,
      subject: 'Your Wilbe Merch Order Confirmation',
      html: createEmailHtml(name, product, size, address),
    });

    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createSlackMessage(name, product, size, address)),
      });
    }

    return res.status(200).json({ status: 'sent' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
}
