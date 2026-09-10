import { conversationService } from '../services/ConversationService.js';
import { Organization } from '../models/Organization.js';
import mongoose from 'mongoose';

export const conversationController = {
  async list(req, res) {
    if (mongoose.connection.readyState !== 1) {
      const { mockMessages } = await import('../services/mockData.js');
      return res.json({
        success: true,
        data: {
          conversations: [
            {
              _id: 'conv-001',
              leadId: 'lead-001',
              channel: 'whatsapp',
              status: 'active',
              lastMessageAt: new Date(),
              unreadCount: 0,
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      });
    }

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
    if (mongoose.connection.readyState !== 1) {
      const { mockMessages } = await import('../services/mockData.js');
      return res.json({
        success: true,
        data: {
          conversation: {
            _id: req.params.id || 'conv-001',
            channel: 'whatsapp',
            status: 'active',
          },
          messages: mockMessages,
        },
      });
    }
    const result = await conversationService.getConversation(req.params.id, req.organizationId);
    res.json({ success: true, data: result });
  },

  async sendMessage(req, res) {
    const { content, aiGenerated, messageType } = req.body;
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        data: {
          message: {
            _id: `msg-${Date.now()}`,
            content,
            body: content,
            aiGenerated: !!aiGenerated,
            direction: 'outbound',
            createdAt: new Date(),
          },
        },
      });
    }

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
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          reply: 'Hi Priya, following up on your request. We would love to hop on a 10-minute discovery call to discuss scope and timelines.',
        },
      });
    }

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
