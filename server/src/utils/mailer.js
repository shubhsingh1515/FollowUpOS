import nodemailer from 'nodemailer';
import { logger } from './logger.js';

class MailerService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'smtp';
    this.isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    }
  }

  getBrandedWrapper(content, title = 'FollowUpOS Notification') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08090C; color: #E4E4E7; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #0E1118; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .logo { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF; text-decoration: none; display: inline-block; margin-bottom: 24px; }
          .logo span { color: #6366F1; }
          h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em; }
          p { font-size: 14px; line-height: 1.6; color: #A1A1AA; margin: 14px 0; }
          .cta-btn { display: inline-block; background: #6366F1; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 20px 0; }
          .divider { border-top: 1px solid rgba(255,255,255,0.08); margin: 28px 0; }
          .footer { font-size: 12px; color: #71717A; text-align: center; line-height: 1.5; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600; background: rgba(99,102,241,0.1); color: #818CF8; border: 1px solid rgba(99,102,241,0.2); }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="${process.env.APP_URL || 'https://followupos.com'}" class="logo">FollowUp<span>OS</span></a>
          ${content}
          <div class="divider"></div>
          <div class="footer">
            FollowUpOS — AI-Powered Sales Follow-up Platform for High-Ticket Service Businesses.<br>
            © ${new Date().getFullYear()} FollowUpOS. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendMail({ to, subject, html, text }) {
    if (!this.isConfigured || process.env.DEMO_MODE === 'true') {
      logger.info(`[MAILER MOCK] To: ${to} | Subject: "${subject}"`);
      return { messageId: `mock_mail_${Date.now()}` };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"FollowUpOS" <notifications@followupos.com>',
        to,
        subject,
        html,
        text: text || subject
      });
      return info;
    } catch (err) {
      logger.error('Failed to send transactional email:', err);
      return null;
    }
  }

  async sendWelcomeEmail(user, organization) {
    const html = this.getBrandedWrapper(`
      <h1>Welcome to FollowUpOS, ${user.name}!</h1>
      <p>Your sales workspace for <strong>${organization.name}</strong> is ready.</p>
      <p>FollowUpOS helps your team capture inbound leads, score intent in real-time, generate contextual replies, and automate follow-ups until deals close.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/onboarding" class="cta-btn">Complete 2-Minute Onboarding →</a>
      <p>Need help setting up your lead sources? Reply directly to this email or access our 24/7 support.</p>
    `, 'Welcome to FollowUpOS');

    return this.sendMail({
      to: user.email,
      subject: 'Welcome to FollowUpOS — Let\'s get your sales engine running',
      html
    });
  }

  async sendVerificationEmail(user, token) {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
    const html = this.getBrandedWrapper(`
      <h1>Verify your email address</h1>
      <p>Please confirm your email address to secure your FollowUpOS account and activate live lead ingestion.</p>
      <a href="${verifyUrl}" class="cta-btn">Verify Email Address →</a>
      <p style="font-size: 12px; color: #71717A;">Or copy and paste this URL into your browser:<br>${verifyUrl}</p>
      <p>This verification link will expire in 24 hours.</p>
    `, 'Verify Email');

    return this.sendMail({
      to: user.email,
      subject: 'Verify your email address — FollowUpOS',
      html
    });
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    const html = this.getBrandedWrapper(`
      <h1>Reset your FollowUpOS password</h1>
      <p>We received a request to reset the password for your account (${user.email}).</p>
      <a href="${resetUrl}" class="cta-btn">Reset Password →</a>
      <p style="font-size: 12px; color: #71717A;">This link is single-use and will expire in 1 hour.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `, 'Password Reset');

    return this.sendMail({
      to: user.email,
      subject: 'Reset your FollowUpOS password',
      html
    });
  }

  async sendSubscriptionActiveEmail(user, organization, planName, amount) {
    const html = this.getBrandedWrapper(`
      <h1>Your ${planName} Plan is Active!</h1>
      <p>Thank you for subscribing to FollowUpOS for <strong>${organization.name}</strong>.</p>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #FFFFFF; font-weight: 600;">Plan: <span class="badge">${planName}</span></p>
        <p style="margin: 8px 0 0 0; color: #A1A1AA; font-size: 13px;">Billing Amount: ₹${amount.toLocaleString()}/cycle</p>
      </div>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/today" class="cta-btn">Go to Today Cockpit →</a>
    `, 'Subscription Activated');

    return this.sendMail({
      to: user.email,
      subject: `Your FollowUpOS ${planName} plan is now active`,
      html
    });
  }

  async sendHighIntentLeadAlert(user, lead, score) {
    const html = this.getBrandedWrapper(`
      <h1>🔥 High-Intent Lead Detected (${score}/100)</h1>
      <p>A new high-value lead has been captured and scored by FollowUpOS AI:</p>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #FFFFFF; font-weight: 600;">Name: ${lead.name || lead.firstName}</p>
        <p style="margin: 4px 0; color: #A1A1AA; font-size: 13px;">Email: ${lead.email || 'N/A'}</p>
        <p style="margin: 4px 0; color: #A1A1AA; font-size: 13px;">Phone: ${lead.phone || 'N/A'}</p>
        <p style="margin: 4px 0; color: #A1A1AA; font-size: 13px;">Service: ${lead.service || 'Inquiry'}</p>
        <p style="margin: 8px 0 0 0; color: #818CF8; font-family: monospace; font-size: 12px;">AI Intent: High conversion probability</p>
      </div>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/leads/${lead._id}" class="cta-btn">View Lead & Send 1-Click Reply →</a>
    `, 'High-Intent Lead Alert');

    return this.sendMail({
      to: user.email,
      subject: `🔥 High-Intent Lead (${score}/100): ${lead.name || lead.firstName}`,
      html
    });
  }
}

export const mailerService = new MailerService();
export default mailerService;
