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
    const leads = await leadService.getTodaysPriorities(
      req.organizationId,
      req.user._id
    );
    res.json({ success: true, data: { leads } });
  },
};

export default leadController;
