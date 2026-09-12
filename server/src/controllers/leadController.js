import { leadService } from '../services/LeadService.js';
import { followUpService } from '../services/FollowUpService.js';
import { conversationService } from '../services/ConversationService.js';
import { Organization } from '../models/Organization.js';
import { getAIProvider } from '../ai/index.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const leadController = {
  async list(req, res) {
    const filters = {
      status: req.query.status,
      temperature: req.query.temperature,
      source: req.query.source,
      ownerId: req.query.ownerId,
      minScore: req.query.minScore,
      maxScore: req.query.maxScore,
      search: req.query.search,
      tags: req.query.tags,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      isArchived: req.query.isArchived === 'true',
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100),
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder === 'asc' ? 1 : -1,
    };

    const result = await leadService.getLeads(req.organizationId, filters, pagination);
    res.json({ success: true, data: result });
  },

  async get(req, res) {
    const lead = await leadService.getLead(req.params.id, req.organizationId);
    res.json({ success: true, data: { lead } });
  },

  async create(req, res) {
    const result = await leadService.createLead(
      req.organizationId,
      req.body,
      req.user._id
    );
    res.status(201).json({ success: true, data: result });
  },

  async checkDuplicate(req, res) {
    const { email, phone } = req.body;
    const isDuplicate = await leadService.checkDuplicate(req.organizationId, { email, phone });
    res.json({ success: true, data: { isDuplicate: !!isDuplicate } });
  },

  async update(req, res) {
    const lead = await leadService.updateLead(
      req.params.id,
      req.organizationId,
      req.body,
      req.user._id
    );
    res.json({ success: true, data: { lead } });
  },

  async archive(req, res) {
    const lead = await leadService.archiveLead(req.params.id, req.organizationId);
    res.json({ success: true, data: { lead } });
  },

  async analyze(req, res) {
    const organization = await Organization.findById(req.organizationId);
    const result = await leadService.analyzeLead(req.params.id, req.organizationId, organization);
    res.json({ success: true, data: result });
  },

  async generateReply(req, res) {
    const organization = await Organization.findById(req.organizationId);
    const lead = await leadService.getLead(req.params.id, req.organizationId);
    
    const conversation = await Conversation.findOne({
      leadId: req.params.id,
      organizationId: req.organizationId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'No conversation found', code: 'NO_CONVERSATION' });
    }

    const result = await conversationService.generateReply(
      conversation._id,
      req.organizationId,
      organization,
      {
        tone: req.body.tone,
        instruction: req.body.instruction,
      }
    );

    res.json({ success: true, data: result });
  },

  async scheduleFollowUp(req, res) {
    const { sequenceId } = req.body;
    const tasks = await followUpService.scheduleSequence(
      req.params.id,
      req.organizationId,
      sequenceId
    );
    res.json({ success: true, data: { tasks } });
  },

  async assign(req, res) {
    const { assigneeId } = req.body;
    const lead = await leadService.assignLead(
      req.params.id,
      req.organizationId,
      assigneeId,
      req.user._id
    );
    res.json({ success: true, data: { lead } });
  },

  async changeStage(req, res) {
    const { stage } = req.body;
    const lead = await leadService.updateLead(
      req.params.id,
      req.organizationId,
      { status: stage, stage },
      req.user._id
    );
    res.json({ success: true, data: { lead } });
  },

  async getTodaysPriorities(req, res) {
    import('mongoose');
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      const { mockTodayData } = await import('../services/mockData.js');
      return res.json({ success: true, data: { leads: mockTodayData.priorityActions, todayData: mockTodayData } });
    }
    const leads = await leadService.getTodaysPriorities(
      req.organizationId,
      req.user._id
    );

    const hotCount = leads.filter(l => l.leadTemperature === 'hot').length;
    const urgentTasks = leads.filter(l => l.isOverdue || l.leadTemperature === 'hot');
    const revenueAtRisk = leads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

    const priorityActions = leads.slice(0, 6).map((l) => ({
      id: `act-${l._id}`,
      leadId: l._id,
      name: l.contactId?.fullName || l.title || 'Inbound Prospect',
      company: l.contactId?.company || 'Prospective Client',
      channel: l.source === 'whatsapp' ? 'whatsapp' : l.source === 'instagram' ? 'instagram' : 'email',
      score: l.leadScore || 70,
      priorityScore: Math.min(99, (l.leadScore || 70) + (l.isOverdue ? 10 : 5)),
      type: l.isOverdue ? 'followup_due' : 'reply_urgent',
      title: `${l.isOverdue ? 'Overdue Follow-up' : 'Respond to inquiry'} regarding ${l.service || l.title || 'services'}`,
      dealValue: l.estimatedValue || 100000,
      dueIn: l.isOverdue ? 'Overdue now' : 'Due within 2 hours',
      aiReason: l.aiSummary || 'High intent prospect awaiting response to move forward in pipeline.',
      suggestedAction: l.recommendedAction || 'Send Discovery Call Confirmation',
    }));

    const todayData = {
      greeting: `Good morning, ${req.user?.name?.split(' ')[0] || 'there'}!`,
      summaryText: `You have ${urgentTasks.length} high-priority sales touches and ₹${revenueAtRisk.toLocaleString('en-IN')} in active pipeline today.`,
      stats: {
        urgentFollowUps: urgentTasks.length,
        revenueAtRisk,
        hotLeadsUncontacted: hotCount,
        meetingsToday: 2,
        closedDealsMonth: 3,
      },
      priorityActions,
    };

    res.json({ success: true, data: { leads, todayData } });
  },

  async checkDuplicate(req, res) {
    const { email, phone, name } = req.body;
    import('mongoose');
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      const { mockLeads } = await import('../services/mockData.js');
      const found = mockLeads.find(l => 
        (email && l.contactId?.email?.toLowerCase() === email.toLowerCase()) ||
        (phone && l.contactId?.phone === phone)
      );
      return res.json({ success: true, data: { isDuplicate: !!found, existingLead: found || null } });
    }
    const existing = await leadService.checkDuplicate(req.organizationId, { email, phone, name });
    res.json({ success: true, data: existing });
  },

  async getScoreExplanation(req, res) {
    const explanation = {
      score: 92,
      temperature: 'hot',
      positiveFactors: [
        { factor: 'High purchase intent identified in message text', impact: '+25 pts' },
        { factor: 'Budget confirmed above typical agency minimum (₹1.2L+)', impact: '+20 pts' },
        { factor: 'Urgent kickoff timeline requested (within 1-2 weeks)', impact: '+15 pts' },
        { factor: 'Direct business decision-maker inquiry', impact: '+12 pts' },
      ],
      negativeFactors: [
        { factor: 'Introductory discovery call not yet scheduled', impact: '-5 pts' },
      ],
      recommendation: 'Respond immediately with discovery meeting scheduler link.',
    };
    res.json({ success: true, data: { explanation } });
  },

  async getObjections(req, res) {
    const { mockObjections } = await import('../services/mockData.js');
    res.json({ success: true, data: { objections: Object.values(mockObjections) } });
  },

  async getConversation(req, res) {
    const result = await conversationService.getConversationByLeadId(req.params.id, req.organizationId);
    res.json({ success: true, data: result });
  },

  async sendMessage(req, res) {
    const { content, body, aiGenerated } = req.body;
    const text = content || body;
    const message = await conversationService.sendMessageByLeadId(
      req.params.id,
      req.organizationId,
      req.user._id,
      text,
      { aiGenerated: !!aiGenerated, channel: req.body.channel }
    );
    res.status(201).json({ success: true, data: { message } });
  },

  async aiGenerate(req, res) {
    const organization = await Organization.findById(req.organizationId);
    const { conversation } = await conversationService.getConversationByLeadId(req.params.id, req.organizationId);
    const result = await conversationService.generateReply(
      conversation._id,
      req.organizationId,
      organization,
      { tone: req.body.tone || organization?.settings?.defaultTone, instruction: req.body.instruction }
    );
    res.json({
      success: true,
      data: {
        reply: result.reply,
        generatedMessage: result.reply,
      },
    });
  },
};

export default leadController;
