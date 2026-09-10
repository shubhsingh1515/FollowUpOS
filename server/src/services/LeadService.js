import { Lead } from '../models/Lead.js';
import { Contact } from '../models/Contact.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Activity } from '../models/Activity.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { getAIProvider } from '../ai/index.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class LeadService {
  /**
   * Get leads with filters and pagination
   */
  async getLeads(organizationId, filters = {}, pagination = {}) {
    import('mongoose');
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      const { mockLeads } = await import('./mockData.js');
      let filtered = [...mockLeads];
      if (filters.status) filtered = filtered.filter(l => l.status === filters.status);
      if (filters.temperature) filtered = filtered.filter(l => l.leadTemperature === filters.temperature);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(l => l.name.toLowerCase().includes(s) || l.contactId?.company?.toLowerCase().includes(s));
      }
      return {
        leads: filtered,
        total: filtered.length,
        totalPages: 1,
        page: 1,
      };
    }

    const {
      status, temperature, source, ownerId,
      minScore, maxScore, search, tags,
      startDate, endDate, isArchived = false,
    } = filters;

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = -1 } = pagination;

    const query = { organizationId, isArchived };

    if (status) query.status = status;
    if (temperature) query.leadTemperature = temperature;
    if (source) query.source = source;
    if (ownerId) query.ownerId = ownerId;
    if (minScore !== undefined) query.leadScore = { ...query.leadScore, $gte: Number(minScore) };
    if (maxScore !== undefined) query.leadScore = { ...query.leadScore, $lte: Number(maxScore) };
    if (tags?.length) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Text search via contact
    let contactIds;
    if (search) {
      const regex = new RegExp(search, 'i');
      const contacts = await Contact.find({
        organizationId,
        $or: [
          { fullName: regex },
          { email: regex },
          { phone: regex },
          { company: regex },
        ],
      }).select('_id');
      contactIds = contacts.map((c) => c._id);
      query.$or = [
        { contactId: { $in: contactIds } },
        { title: regex },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder };

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('contactId', 'fullName email phone company avatar source')
        .populate('ownerId', 'name avatar email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return {
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single lead with full details
   */
  async getLead(leadId, organizationId) {
    import('mongoose');
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      const { mockLeads } = await import('./mockData.js');
      return mockLeads.find(l => l._id === leadId) || mockLeads[0];
    }

    const lead = await Lead.findOne({ _id: leadId, organizationId })
      .populate('contactId')
      .populate('ownerId', 'name avatar email');

    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    return lead;
  }

  /**
   * Create a new lead (and optionally create/upsert contact)
   */
  async createLead(organizationId, data, createdById) {
    const {
      contactId, firstName, lastName, email, phone, company,
      title, description, source, estimatedValue, currency,
      ownerId, tags, message,
    } = data;

    let contact;

    if (contactId) {
      contact = await Contact.findOne({ _id: contactId, organizationId });
      if (!contact) throw new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
    } else {
      // Find or create contact
      contact = await Contact.findOneAndUpdate(
        {
          organizationId,
          $or: [
            email ? { email: email.toLowerCase() } : null,
            phone ? { phone } : null,
          ].filter(Boolean).reduce((acc, c) => ({ ...acc, ...c }), {}),
        },
        {
          $setOnInsert: {
            organizationId,
            firstName,
            lastName,
            fullName: [firstName, lastName].filter(Boolean).join(' '),
            email: email?.toLowerCase(),
            phone,
            company,
            source: source || 'manual',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      // If contact didn't exist (was just inserted)
      if (!contact.firstName && firstName) {
        contact.firstName = firstName;
        contact.lastName = lastName;
        contact.fullName = [firstName, lastName].filter(Boolean).join(' ');
        if (email) contact.email = email.toLowerCase();
        if (phone) contact.phone = phone;
        if (company) contact.company = company;
        contact.source = source || 'manual';
        await contact.save();
      }
    }

    // Create the lead
    const lead = await Lead.create({
      organizationId,
      contactId: contact._id,
      ownerId: ownerId || createdById,
      title: title || `${contact.fullName} — ${source || 'New Lead'}`,
      description,
      source: source || 'manual',
      estimatedValue: estimatedValue || 0,
      currency: currency || 'INR',
      tags: tags || [],
      status: 'new',
      stage: 'new',
    });

    // Create initial conversation
    const conversation = await Conversation.create({
      organizationId,
      leadId: lead._id,
      contactId: contact._id,
      channel: source || 'manual',
      status: 'open',
    });

    // Save initial message if provided
    if (message) {
      await Message.create({
        organizationId,
        conversationId: conversation._id,
        leadId: lead._id,
        senderType: 'customer',
        senderId: contact._id,
        direction: 'inbound',
        channel: source || 'manual',
        content: message,
        messageType: 'text',
      });

      lead.lastInboundAt = new Date();
      await lead.save();
    }

    // Log activity
    await Activity.create({
      organizationId,
      leadId: lead._id,
      contactId: contact._id,
      userId: createdById,
      type: 'lead_created',
      title: `Lead created for ${contact.fullName}`,
      metadata: { source, leadId: lead._id },
    });

    logger.info('Lead created', { leadId: lead._id, orgId: organizationId });
    return { lead, contact, conversation };
  }

  /**
   * Update a lead
   */
  async updateLead(leadId, organizationId, updates, userId) {
    const lead = await Lead.findOne({ _id: leadId, organizationId });
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

    const prevStatus = lead.status;
    const prevScore = lead.leadScore;

    Object.assign(lead, updates);
    await lead.save();

    // Log stage changes
    if (updates.status && updates.status !== prevStatus) {
      await Activity.create({
        organizationId,
        leadId: lead._id,
        userId,
        type: 'lead_stage_changed',
        title: `Lead stage changed to ${updates.status}`,
        metadata: { from: prevStatus, to: updates.status },
      });
    }

    // Log score changes
    if (updates.leadScore !== undefined && updates.leadScore !== prevScore) {
      await Activity.create({
        organizationId,
        leadId: lead._id,
        userId,
        type: 'lead_score_changed',
        title: `AI Lead Score updated: ${prevScore} → ${updates.leadScore}`,
        metadata: { from: prevScore, to: updates.leadScore },
      });
    }

    return lead;
  }

  /**
   * Run AI analysis on a lead
   */
  async analyzeLead(leadId, organizationId, organization) {
    const lead = await Lead.findOne({ _id: leadId, organizationId }).populate('contactId');
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

    // Get conversation messages
    const conversation = await Conversation.findOne({ leadId, organizationId });
    let messages = [];
    if (conversation) {
      messages = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .limit(20)
        .lean();
    }

    // If no messages, use lead description
    if (!messages.length && lead.description) {
      messages = [{ content: lead.description, direction: 'inbound' }];
    }

    if (!messages.length) {
      throw new AppError('No conversation data to analyze', 400, 'NO_DATA');
    }

    const ai = getAIProvider();
    
    const analysisInput = {
      org: organization,
      services: organization.services || [],
      messages,
      leadInfo: {
        name: lead.contactId?.fullName,
        company: lead.contactId?.company,
        source: lead.source,
      },
    };

    const startTime = Date.now();
    let analysis;
    let success = true;
    let errorMsg;

    try {
      analysis = await ai.analyzeLead(analysisInput);
    } catch (error) {
      logger.error('AI analysis failed:', error.message);
      success = false;
      errorMsg = error.message;
      // Use fallback
      analysis = {
        score: lead.leadScore || 30,
        temperature: lead.leadTemperature || 'cold',
        intent: lead.intent || 'inquiry',
        intentConfidence: 0.3,
        summary: 'AI analysis unavailable. Please review manually.',
        insights: [],
        recommendedAction: 'Review lead manually.',
        nextFollowUpHours: 24,
        budget: { currency: organization.currency || 'INR' },
      };
    }

    // Save analysis to history
    await AIAnalysis.create({
      organizationId,
      leadId,
      type: 'lead_analysis',
      input: messages.map((m) => m.content).join('\n'),
      output: analysis,
      model: analysis.source === 'openai' ? organization.settings?.aiModel || 'gpt-4o-mini' : 'mock',
      tokensUsed: analysis.tokensUsed,
      durationMs: Date.now() - startTime,
      success,
      error: errorMsg,
    });

    // Update lead with analysis results
    const temperature = analysis.score >= 70 ? 'hot' : analysis.score >= 45 ? 'warm' : 'cold';
    
    const updates = {
      leadScore: analysis.score,
      leadTemperature: temperature,
      intent: analysis.intent,
      intentConfidence: analysis.intentConfidence,
      aiSummary: analysis.summary,
      aiInsights: analysis.insights,
      aiRecommendations: analysis.insights,
      recommendedAction: analysis.recommendedAction,
      service: analysis.service,
      lastAnalyzedAt: new Date(),
    };

    if (analysis.budget?.min || analysis.budget?.max) {
      updates.budget = analysis.budget;
    }
    if (analysis.timeline) updates.timeline = analysis.timeline;
    if (analysis.industry) updates.industry = analysis.industry;
    if (analysis.nextFollowUpHours) {
      updates.nextFollowUpAt = new Date(Date.now() + analysis.nextFollowUpHours * 3600000);
    }
    if (!lead.estimatedValue && analysis.budget?.max) {
      updates.estimatedValue = analysis.budget.max;
    }

    await Lead.findByIdAndUpdate(leadId, updates);

    // Log activity
    await Activity.create({
      organizationId,
      leadId,
      type: 'ai_analyzed',
      title: `AI analyzed lead — Score: ${analysis.score}, ${temperature.toUpperCase()}`,
      metadata: { score: analysis.score, temperature, intent: analysis.intent },
    });

    return { lead: { ...lead.toObject(), ...updates }, analysis };
  }

  /**
   * Get today's priorities for the dashboard
   */
  async getTodaysPriorities(organizationId, userId, limit = 10) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Hot leads with pending follow-ups
    const leads = await Lead.find({
      organizationId,
      isArchived: false,
      status: { $nin: ['won', 'lost'] },
      $or: [
        { nextFollowUpAt: { $lte: endOfDay } },
        { leadTemperature: 'hot' },
        { lastInboundAt: { $gte: new Date(now - 24 * 3600000) } },
      ],
    })
      .populate('contactId', 'fullName company')
      .sort({ leadScore: -1, nextFollowUpAt: 1 })
      .limit(limit)
      .lean();

    return leads.map((lead) => ({
      ...lead,
      isOverdue: lead.nextFollowUpAt && lead.nextFollowUpAt < now,
      hasRecentReply: lead.lastInboundAt && (now - new Date(lead.lastInboundAt)) < 24 * 3600000,
    }));
  }

  /**
   * Assign lead to a user
   */
  async assignLead(leadId, organizationId, assigneeId, assignedById) {
    const lead = await Lead.findOne({ _id: leadId, organizationId });
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

    const prevOwner = lead.ownerId;
    lead.ownerId = assigneeId;
    await lead.save();

    await Activity.create({
      organizationId,
      leadId,
      userId: assignedById,
      type: 'lead_assigned',
      title: `Lead assigned to new owner`,
      metadata: { from: prevOwner, to: assigneeId },
    });

    return lead;
  }

  /**
   * Delete/archive a lead
   */
  async archiveLead(leadId, organizationId) {
    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, organizationId },
      { isArchived: true },
      { new: true }
    );
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

    // Cancel pending follow-ups
    await FollowUpTask.updateMany(
      { leadId, status: 'pending' },
      { status: 'cancelled', cancelledAt: new Date(), cancelledReason: 'Lead archived' }
    );

    return lead;
  }
}

export const leadService = new LeadService();
export default leadService;
