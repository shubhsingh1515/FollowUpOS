import { Router } from 'express';
import { billingService } from '../billing/BillingService.js';
import { Contact } from '../models/Contact.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { Notification } from '../models/Notification.js';
import { getAIProvider } from '../ai/index.js';
import { usageService } from '../billing/UsageService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * RAZORPAY BILLING WEBHOOK
 * POST /api/webhooks/razorpay
 */
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await billingService.handleWebhook(
      'razorpay',
      req.body,
      signature,
      req.body
    );
    res.json({ received: true, result });
  } catch (err) {
    logger.error('Razorpay webhook error:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * WHATSAPP WEBHOOK VERIFICATION (Meta App requirement)
 * GET /api/webhooks/whatsapp
 */
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'followupos_whatsapp_verify';

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: 'Verification failed' });
});

/**
 * WHATSAPP INBOUND MESSAGE WEBHOOK
 * POST /api/webhooks/whatsapp
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    res.status(200).json({ status: 'received' });

    if (body.object === 'whatsapp_business_account' && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value?.messages) {
            for (const msg of value.messages) {
              const fromPhone = msg.from;
              const text = msg.text?.body || '[Media/Non-text message]';

              const contact = await Contact.findOne({ phone: new RegExp(fromPhone.slice(-10)) });
              if (contact) {
                let conv = await Conversation.findOne({ contactId: contact._id });
                if (!conv) {
                  conv = await Conversation.create({
                    organizationId: contact.organizationId,
                    contactId: contact._id,
                    channel: 'whatsapp',
                    status: 'open',
                    lastMessageAt: new Date()
                  });
                }

                await Message.create({
                  organizationId: contact.organizationId,
                  conversationId: conv._id,
                  contactId: contact._id,
                  senderType: 'contact',
                  channel: 'whatsapp',
                  body: text,
                  status: 'delivered',
                  sentAt: new Date()
                });

                // Auto-pause active follow-ups for this contact
                await FollowUpTask.updateMany(
                  { contactId: contact._id, status: 'pending' },
                  { status: 'cancelled', result: 'Prospect replied via WhatsApp (auto-paused)' }
                );

                // Run AI Intent Analysis
                try {
                  const aiProvider = getAIProvider();
                  const analysis = await aiProvider.analyzeConversation([
                    { role: 'user', content: text }
                  ]);

                  await Notification.create({
                    organizationId: contact.organizationId,
                    type: 'lead_reply',
                    title: `Inbound WhatsApp from ${contact.name}`,
                    message: text,
                    data: { contactId: contact._id, conversationId: conv._id, analysis }
                  });

                  await usageService.trackUsage(contact.organizationId, 'AI_ANALYSIS', 1);
                } catch (aiErr) {
                  logger.warn('AI analysis skipped on WhatsApp webhook:', aiErr.message);
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    logger.error('Error handling WhatsApp webhook:', err);
  }
});

/**
 * CALENDLY MEETING BOOKED WEBHOOK
 * POST /api/webhooks/calendly
 */
router.post('/calendly', async (req, res) => {
  try {
    const event = req.body;
    res.status(200).json({ received: true });

    if (event.event === 'invitee.created') {
      const invitee = event.payload?.invitee || {};
      const email = invitee.email;
      const name = invitee.name;

      if (email) {
        const contact = await Contact.findOne({ email: email.toLowerCase() });
        if (contact) {
          await FollowUpTask.updateMany(
            { contactId: contact._id, status: 'pending' },
            { status: 'cancelled', result: 'Meeting booked via Calendly' }
          );

          await Lead.findOneAndUpdate(
            { contactId: contact._id },
            { stage: 'meeting_scheduled', updatedAt: new Date() }
          );

          await Notification.create({
            organizationId: contact.organizationId,
            type: 'meeting_booked',
            title: `Meeting Booked: ${name || contact.name}`,
            message: `Scheduled discovery call via Calendly with ${email}`,
            data: { contactId: contact._id }
          });
        }
      }
    }
  } catch (err) {
    logger.error('Error processing Calendly webhook:', err);
  }
});

/**
 * META LEAD ADS WEBHOOK
 * GET /api/webhooks/meta & POST /api/webhooks/meta
 */
router.get('/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === (process.env.META_VERIFY_TOKEN || 'followupos_meta_verify')) {
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: 'Meta verification failed' });
});

router.post('/meta', async (req, res) => {
  res.status(200).json({ received: true });
});

export default router;
