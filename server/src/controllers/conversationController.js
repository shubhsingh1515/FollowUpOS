import { conversationService } from '../services/ConversationService.js';
import { Organization } from '../models/Organization.js';

export const conversationController = {
  async list(req, res) {
    const filters = {
      status: req.query.status,
      channel: req.query.channel,
      assignedTo: req.query.assignedTo,
      unreadOnly: req.query.unreadOnly === 'true',
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const result = await conversationService.getConversations(req.organizationId, filters, pagination);
    res.json({ success: true, data: result });
  },

  async get(req, res) {
    import('mongoose');
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      const { mockMessages } = await import('../services/mockData.js');
      return res.json({ success: true, data: { conversation: { _id: req.params.id }, messages: mockMessages } });
    }
    const result = await conversationService.getConversation(req.params.id, req.organizationId);
    res.json({ success: true, data: result });
  },

  async sendMessage(req, res) {
    const { content, aiGenerated, messageType } = req.body;
    const message = await conversationService.sendMessage(
      req.params.id,
      req.organizationId,
      req.user._id,
      content,
      { aiGenerated, messageType }
    );
    res.status(201).json({ success: true, data: { message } });
  },

  async generateReply(req, res) {
    const organization = await Organization.findById(req.organizationId);
    const result = await conversationService.generateReply(
      req.params.id,
      req.organizationId,
      organization,
      { tone: req.body.tone, instruction: req.body.instruction }
    );
    res.json({ success: true, data: result });
  },
};

export default conversationController;
