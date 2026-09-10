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

export default router;
