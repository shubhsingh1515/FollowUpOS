import { leadService } from '../services/LeadService.js';
import { followUpService } from '../services/FollowUpService.js';
import { conversationService } from '../services/ConversationService.js';
import { Organization } from '../models/Organization.js';
import { getAIProvider } from '../ai/index.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { Deal } from '../models/Deal.js';
import { Activity } from '../models/Activity.js';

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
    const { email, phone, name } = req.body;
    const existing = await leadService.checkDuplicate(req.organizationId, { email, phone, name });
    res.json({ success: true, data: existing });
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

  /**
   * GET /api/leads/priorities
   * Today's priority leads — calculated from real data.
   */
  async getTodaysPriorities(req, res) {
    const leads = await leadService.getTodaysPriorities(
      req.organizationId,
      req.user._id
    );

    const hotCount = leads.filter(l => l.leadTemperature === 'hot').length;
    const urgentTasks = leads.filter(l => l.isOverdue || l.leadTemperature === 'hot');
    const revenueAtRisk = leads
      .filter(l => l.isOverdue || (l.lastContactAt == null))
      .reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

    // Real meeting count from today's activities
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const meetingsToday = await Activity.countDocuments({
      organizationId: req.organizationId,
      type: 'meeting_booked',
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Real closed deals count for current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const closedDealsMonth = await Deal.countDocuments({
      organizationId: req.organizationId,
      stage: 'won',
      wonAt: { $gte: startOfMonth },
    });

    const priorityActions = leads.slice(0, 6).map((l) => ({
      id: `act-${l._id}`,
      leadId: l._id,
      name: l.contactId?.fullName || l.title || 'Inbound Prospect',
      company: l.contactId?.company || 'Prospective Client',
      channel: l.source === 'whatsapp' ? 'whatsapp' : l.source === 'instagram' ? 'instagram' : 'email',
      score: l.leadScore || 0,
      priorityScore: Math.min(99, (l.leadScore || 50) + (l.isOverdue ? 15 : l.hasRecentReply ? 10 : 5)),
      type: l.isOverdue ? 'followup_due' : l.hasRecentReply ? 'reply_urgent' : 'qualify_inbound',
      title: l.isOverdue
        ? `Overdue follow-up — ${l.contactId?.fullName || 'lead'} has not been contacted`
        : l.hasRecentReply
          ? `Reply to recent ${l.source || 'channel'} message from ${l.contactId?.fullName || 'lead'}`
          : `Follow up with ${l.contactId?.fullName || 'lead'}`,
      dealValue: l.estimatedValue || 0,
      dueIn: l.isOverdue ? 'Overdue now' : 'Due within 2 hours',
      aiReason: l.aiSummary || 'Lead requires attention based on score and activity.',
      suggestedAction: l.recommendedAction || 'Open Lead',
    }));

    // Revenue at risk: high-value leads with no outbound contact in 48h
    const riskThreshold = new Date(Date.now() - 48 * 3600 * 1000);
    const atRiskLeads = leads.filter(
      l => l.estimatedValue > 0 && (!l.lastContactAt || new Date(l.lastContactAt) < riskThreshold)
    );
    const revenueAtRiskItems = atRiskLeads.slice(0, 3).map(l => ({
      leadId: l._id,
      name: l.contactId?.fullName || 'Lead',
      company: l.contactId?.company || '',
      value: l.estimatedValue || 0,
      reason: l.lastContactAt
        ? `No contact in ${Math.floor((Date.now() - new Date(l.lastContactAt)) / 3600000)} hours.`
        : 'Never contacted since lead creation.',
      urgency: !l.lastContactAt ? 'high' : 'medium',
    }));

    // Lead decay: hot/warm leads going silent
    const decayThreshold = new Date(Date.now() - 72 * 3600 * 1000);
    const decayLeads = leads.filter(
      l => l.leadTemperature !== 'cold' &&
        l.lastInboundAt &&
        new Date(l.lastInboundAt) < decayThreshold
    );
    const leadDecay = decayLeads.slice(0, 3).map(l => {
      const daysSilent = Math.floor((Date.now() - new Date(l.lastInboundAt)) / 86400000);
      return {
        leadId: l._id,
        name: l.contactId?.fullName || 'Lead',
        company: l.contactId?.company || '',
        daysSilent,
        lastScore: l.leadScore || 0,
        currentScore: Math.max(0, (l.leadScore || 50) - daysSilent * 3),
        recommended: 'Send a low-friction re-engagement message.',
      };
    });

    const firstName = req.user?.name?.split(' ')[0] || 'there';
    const hour = now.getHours();
    const greeting = `Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${firstName}!`;

    const summaryText = urgentTasks.length > 0
      ? `You have ${urgentTasks.length} high-priority sales touch${urgentTasks.length !== 1 ? 'es' : ''} today.`
      : "You're all caught up — no urgent actions right now.";

    const todayData = {
      greeting,
      summaryText,
      stats: {
        urgentFollowUps: urgentTasks.length,
        revenueAtRisk,
        hotLeadsUncontacted: hotCount,
        meetingsToday,
        closedDealsMonth,
      },
      priorityActions,
      revenueAtRisk: revenueAtRiskItems,
      leadDecay,
    };

    res.json({ success: true, data: { leads, todayData } });
  },

  /**
   * GET /api/leads/:id/score-explanation
   * Returns real AI analysis factors for a lead — no hardcoded data.
   */
  async getScoreExplanation(req, res) {
    const analysis = await AIAnalysis.findOne({
      leadId: req.params.id,
      organizationId: req.organizationId,
      type: 'lead_analysis',
      success: true,
    }).sort({ createdAt: -1 });

    if (!analysis || !analysis.output) {
      return res.json({
        success: true,
        data: {
          explanation: null,
          message: 'No AI analysis available for this lead yet. Run an analysis first.',
        },
      });
    }

    const output = analysis.output;

    // Build explanation from stored analysis output
    const explanation = {
      score: output.score || 0,
      temperature: output.temperature || 'cold',
      intent: output.intent,
      confidence: output.intentConfidence,
      summary: output.summary,
      positiveFactors: [],
      negativeFactors: [],
      recommendation: output.recommendedAction || 'Review lead manually.',
      analyzedAt: analysis.createdAt,
    };

    // Build factor list from actual analysis output fields
    if (output.score >= 70) explanation.positiveFactors.push({ factor: 'High lead score indicates strong purchase intent', impact: `Score: ${output.score}` });
    if (output.intent && output.intent !== 'inquiry') explanation.positiveFactors.push({ factor: `Intent detected: ${output.intent}`, impact: '+intent signal' });
    if (output.budget?.min || output.budget?.max) explanation.positiveFactors.push({ factor: 'Budget information identified in conversation', impact: '+budget signal' });
    if (output.timeline) explanation.positiveFactors.push({ factor: `Timeline mentioned: ${output.timeline}`, impact: '+urgency signal' });
    if (output.buyingSignals?.length) output.buyingSignals.forEach(s => explanation.positiveFactors.push({ factor: s, impact: '+buying signal' }));
    if (output.painPoints?.length) explanation.positiveFactors.push({ factor: `Pain points identified: ${output.painPoints.slice(0, 2).join(', ')}`, impact: '+qualification' });

    if (output.objections?.length) output.objections.forEach(o => explanation.negativeFactors.push({ factor: o, impact: '-objection' }));
    if (output.score < 50) explanation.negativeFactors.push({ factor: 'Low confidence in purchase intent', impact: '-intent signal' });
    if (!output.budget?.min && !output.budget?.max) explanation.negativeFactors.push({ factor: 'Budget not confirmed yet', impact: '-qualification gap' });

    res.json({ success: true, data: { explanation } });
  },

  /**
   * GET /api/leads/:id/objections
   * Returns real objections from stored AI analysis.
   */
  async getObjections(req, res) {
    const analysis = await AIAnalysis.findOne({
      leadId: req.params.id,
      organizationId: req.organizationId,
      type: 'lead_analysis',
      success: true,
    }).sort({ createdAt: -1 });

    if (!analysis || !analysis.output) {
      return res.json({ success: true, data: { objections: [] } });
    }

    const output = analysis.output;
    const objections = [];

    if (output.objections?.length) {
      output.objections.forEach(o => {
        objections.push({
          type: 'Identified Objection',
          detectedSnippet: o,
          recommendedStrategy: 'Address directly with proof or social evidence.',
          suggestedRebuttal: output.recommendedAction || 'Understand the concern and provide relevant case studies.',
        });
      });
    }

    res.json({ success: true, data: { objections } });
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
