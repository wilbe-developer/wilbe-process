
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

// HTML email template for waitlist confirmation
const createEmailHtml = (name: string, referralLink: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1a365d;">You've Joined the Wilbe Waitlist</h2>
    <p>Hi ${name},</p>
    <p>We'll notify you when the sprint is ready - get prepared!</p>
    <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Get Early Access:</h3>
      <p>Share your personal referral link with 3 other builders to gain early access:</p>
      <p style="background: #edf2f7; padding: 10px; border-radius: 4px; word-break: break-all;"><strong>${referralLink}</strong></p>
    </div>
    <p>Putting Scientists First,<br/>Team Wilbe</p>
  </div>
</body>
</html>
`;

// Slack message formatter
const createSlackMessage = (name: string, email: string, referrerName: string | null, utmSource: string | null, utmMedium: string | null) => {
  let message = `🚀 New waitlist signup: *${name}* (${email})`;
  
  if (referrerName) {
    message += `\nReferred by: ${referrerName}`;
  }
  
  if (utmSource || utmMedium) {
    message += "\nTracking:";
    if (utmSource) message += ` source=${utmSource}`;
    if (utmMedium) message += ` medium=${utmMedium}`;
  }
  
  return { text: message };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, referralLink, referrerName, utmSource, utmMedium } = req.body;

    // Validate required fields
    if (!name || !email || !referralLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send confirmation email to user
    await transporter.sendMail({
      from: '"Wilbe Team" <team@wilbe.com>',
      to: email,
      subject: "You joined the Wilbe waitlist",
      html: createEmailHtml(name, referralLink),
      replyTo: 'members@wilbe.com'
    });

    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_WAITLIST_URL) {
      await fetch(process.env.SLACK_WEBHOOK_WAITLIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createSlackMessage(name, email, referrerName, utmSource, utmMedium)),
      });
    }

    return res.status(200).json({ status: 'sent' });
  } catch (error) {
    console.error('Error sending waitlist notifications:', error);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
}
