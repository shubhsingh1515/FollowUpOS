import { Router } from 'express';
import { leadService } from '../services/LeadService.js';
import { followUpService } from '../services/FollowUpService.js';
import { Organization } from '../models/Organization.js';
import { LeadForm } from '../models/LeadForm.js';
import { User } from '../models/User.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { mailerService } from '../utils/mailer.js';
import { usageService } from '../billing/UsageService.js';

const router = Router();

/**
 * GET /api/public/forms/:formId
 * Fetch form configuration for embed widget
 */
router.get('/forms/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    let form = await LeadForm.findOne({ publicId: formId, isActive: true });
    
    if (!form) {
      // Fallback default form for demo
      return res.json({
        success: true,
        data: {
          publicId: formId,
          title: 'Get in Touch — Instant AI Sales Response',
          subtitle: 'Leave your details and our team will get back to you in under 90 seconds.',
          primaryColor: '#6366F1',
          buttonText: 'Submit Inquiry',
          fields: [
            { id: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
            { id: 'f2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'jane@company.com' },
            { id: 'f3', name: 'phone', label: 'Phone / WhatsApp', type: 'phone', required: true, placeholder: '+91 98765 43210' },
            { id: 'f4', name: 'company', label: 'Company Name', type: 'text', required: false, placeholder: 'Acme Corp' },
            { id: 'f5', name: 'service', label: 'Service Needed', type: 'select', required: true, options: ['Lead Generation & CRM', 'Performance Marketing', 'Web & App Development', 'Consulting'] },
            { id: 'f6', name: 'budget', label: 'Estimated Budget', type: 'budget', required: false, options: ['₹50k - ₹1.5L', '₹1.5L - ₹5L', '₹5L - ₹15L', '₹15L+'] },
            { id: 'f7', name: 'message', label: 'Project Goals', type: 'textarea', required: false, placeholder: 'Tell us about your requirements...' }
          ],
          honeypotField: 'website_url_hp',
          successMessage: 'Thank you! Your inquiry was received. An AI sales agent is reviewing your request.'
        }
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/public/forms/:formId/submit
 * Public Form Submission with Honeypot & Spam Detection
 */
router.post('/forms/:formId/submit', async (req, res) => {
  try {
    const { formId } = req.params;
    const body = req.body;

    // Honeypot spam check
    if (body.website_url_hp || body.hp_field) {
      logger.warn('Spam honeypot triggered on form submit:', { formId });
      return res.status(200).json({ success: true, message: 'Thank you for your submission.' });
    }

    let organization;
    const form = await LeadForm.findOne({ publicId: formId });
    if (form) {
      organization = await Organization.findById(form.organizationId);
      form.submissionsCount += 1;
      await form.save();
    } else {
      organization = await Organization.findOne({ isDemo: true }) || await Organization.findOne();
    }

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found for form' });
    }

    const name = body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'Website Inquirer';
    const email = body.email;
    const phone = body.phone;
    const company = body.company || '';
    const message = body.message || body.projectGoals || 'Website form submission';
    const service = body.service || '';
    const budget = body.budget || '';

    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const { lead, contact } = await leadService.createLead(
      organization._id,
      {
        firstName,
        lastName,
        email,
        phone,
        company,
        service,
        budget,
        source: 'website_form',
        message,
        title: `${name} — Website Form Submission`,
      },
      null
    );

    // Track usage
    await usageService.trackUsage(organization._id, 'LEAD_CREATED', 1, { source: 'website_form' });

    // Background AI analysis and sequence trigger
    setImmediate(async () => {
      try {
        const analysis = await leadService.analyzeLead(lead._id, organization._id, organization);
        await followUpService.scheduleSequence(lead._id, organization._id, null);

        // Alert owner if hot lead
        if (analysis?.score >= 70) {
          const owner = await User.findOne({ organizationId: organization._id, role: 'owner' });
          if (owner) {
            await mailerService.sendHighIntentLeadAlert(owner, lead, analysis.score);
          }
        }
      } catch (err) {
        logger.error('Background form lead processing error:', err.message);
      }
    });

    res.status(201).json({
      success: true,
      message: form?.successMessage || 'Inquiry received successfully! An agent will respond in under 2 minutes.',
      data: {
        leadId: lead._id,
        contactId: contact._id
      }
    });
  } catch (err) {
    logger.error('Form submission failed:', err.message);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

/**
 * POST /api/public/leads
 * Public Lead Ingestion API (Authenticated via Bearer API Key)
 */
router.post('/leads', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let organization;

    if (authHeader && authHeader.startsWith('Bearer fup_')) {
      const apiKey = authHeader.replace('Bearer ', '').trim();
      organization = await Organization.findOne({ 'settings.apiKey': apiKey });
    }

    if (!organization && req.body.organizationSlug) {
      organization = await Organization.findOne({ slug: req.body.organizationSlug });
    }

    if (!organization && config.demo.enabled) {
      organization = await Organization.findOne({ isDemo: true }) || await Organization.findOne();
    }

    if (!organization) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API Key or organization not found',
        code: 'UNAUTHORIZED_API_KEY'
      });
    }

    const { name, firstName, lastName, email, phone, company, service, budget, message, source = 'api' } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Either email or phone is required'
      });
    }

    const parts = (name || '').trim().split(' ');
    const first = firstName || parts[0] || 'Inbound';
    const last = lastName || parts.slice(1).join(' ') || 'Lead';

    const { lead, contact } = await leadService.createLead(
      organization._id,
      {
        firstName: first,
        lastName: last,
        email,
        phone,
        company,
        service,
        budget,
        source,
        message,
        title: `${first} ${last} — Inbound Lead (${source})`
      },
      null
    );

    await usageService.trackUsage(organization._id, 'LEAD_CREATED', 1, { source });

    setImmediate(async () => {
      try {
        await leadService.analyzeLead(lead._id, organization._id, organization);
        await followUpService.scheduleSequence(lead._id, organization._id, null);
      } catch (err) {
        logger.error('Public lead background pipeline error:', err.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lead created and queued for AI analysis',
      data: {
        leadId: lead._id,
        contactId: contact._id,
        status: 'queued'
      }
    });
  } catch (err) {
    logger.error('Public API lead ingestion failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/public/webhooks/leads/:webhookToken
 * Inbound Webhook Token for Zapier, Make, Webflow
 */
router.post('/webhooks/leads/:webhookToken', async (req, res) => {
  try {
    const { webhookToken } = req.params;
    let org = await Organization.findOne({ 'settings.webhookToken': webhookToken });

    if (!org && (webhookToken === 'demo_webhook_token' || config.demo.enabled)) {
      org = await Organization.findOne({ isDemo: true }) || await Organization.findOne();
    }

    if (!org) {
      return res.status(404).json({ error: 'Invalid webhook token' });
    }

    const { name, email, phone, company, message, service, budget, source = 'webhook' } = req.body;

    const parts = (name || 'Webhook Lead').trim().split(' ');
    const { lead } = await leadService.createLead(
      org._id,
      {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        email: email || `webhook_${Date.now()}@example.com`,
        phone: phone || '+91 98765 00000',
        company,
        service,
        budget,
        source: 'inbound_webhook',
        message: message || 'Inbound Webhook payload received',
        title: `${name || 'Lead'} — Inbound Webhook`
      },
      null
    );

    await usageService.trackUsage(org._id, 'LEAD_CREATED', 1, { source: 'webhook' });

    setImmediate(async () => {
      try {
        await leadService.analyzeLead(lead._id, org._id, org);
        await followUpService.scheduleSequence(lead._id, org._id, null);
      } catch (err) {
        logger.error('Webhook lead pipeline error:', err.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Webhook lead received and processed',
      data: {
        leadId: lead._id,
        processedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    logger.error('Webhook lead creation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
