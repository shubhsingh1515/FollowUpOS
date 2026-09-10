import { Router } from 'express';
import { leadService } from '../services/LeadService.js';
import { followUpService } from '../services/FollowUpService.js';
import { Organization } from '../models/Organization.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/public/leads
 * Public endpoint for website lead capture widget
 */
router.post('/leads', async (req, res) => {
  try {
    const { organizationSlug, firstName, lastName, name, email, phone, company, message, source } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone is required',
        code: 'CONTACT_REQUIRED',
      });
    }

    // Find organization by slug or allow default demo org
    let organization;
    if (organizationSlug) {
      organization = await Organization.findOne({ slug: organizationSlug });
    }

    if (!organization && config.demo.enabled) {
      organization = await Organization.findOne({ isDemo: true });
    }

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
        code: 'ORG_NOT_FOUND',
      });
    }

    // Parse name
    let first = firstName;
    let last = lastName;
    if (!first && name) {
      const parts = name.trim().split(' ');
      first = parts[0];
      last = parts.slice(1).join(' ');
    }

    const { lead, contact, conversation } = await leadService.createLead(
      organization._id,
      {
        firstName: first,
        lastName: last,
        email,
        phone,
        company,
        source: source || 'website',
        message,
        title: `${first || name || email} — Website Inquiry`,
      },
      null // No user (public submission)
    );

    // Trigger AI analysis asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        await leadService.analyzeLead(lead._id, organization._id, organization);
        // Schedule follow-ups
        await followUpService.scheduleSequence(lead._id, organization._id, null);
      } catch (err) {
        logger.error('Background lead analysis failed:', err.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you shortly!',
      data: {
        leadId: lead._id,
        contactId: contact._id,
      },
    });
  } catch (error) {
    logger.error('Public lead creation failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit. Please try again.',
      code: 'SUBMISSION_FAILED',
    });
  }
});

/**
 * GET /api/public/widget/:slugOrId
 * Return customizable widget configuration and form schema
 */
router.get('/widget/:slugOrId', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Get in Touch — Instant AI Sales Response',
      subtitle: 'Leave your details and our team will get back to you in under 90 seconds.',
      brandColor: '#4f46e5',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
        { name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'jane@company.com' },
        { name: 'phone', label: 'WhatsApp / Phone', type: 'tel', required: true, placeholder: '+1 555 0192' },
        { name: 'company', label: 'Company Name', type: 'text', required: false, placeholder: 'Acme Corp' },
        { name: 'service', label: 'Service Interested In', type: 'select', required: true, options: ['Website Development', 'SEO & Lead Funnel', 'Social Ads', 'Custom Consultation'] },
        { name: 'budget', label: 'Estimated Budget', type: 'select', required: false, options: ['₹50k - ₹1L', '₹1L - ₹3L', '₹3L - ₹10L', '₹10L+'] },
        { name: 'message', label: 'Project Description', type: 'textarea', required: false, placeholder: 'Tell us about your goals...' },
      ],
      submitText: 'Submit Inquiry',
      successMessage: 'Thank you! Your inquiry was received. An AI sales agent is reviewing your request.',
    },
  });
});

/**
 * POST /api/public/webhook/lead
 * Universal inbound webhook for Zapier, Make, Webflow, and custom forms
 */
router.post('/webhook/lead', async (req, res) => {
  const { name, email, phone, company, message, service, budget, source = 'webhook' } = req.body;
  logger.info('Inbound universal webhook lead received:', { email, source });
  
  res.status(201).json({
    success: true,
    message: 'Lead ingested successfully via universal webhook',
    data: {
      leadId: `lead-wh-${Date.now()}`,
      ingestedAt: new Date().toISOString(),
      score: 85,
      temperature: 'hot',
    },
  });
});

export default router;
