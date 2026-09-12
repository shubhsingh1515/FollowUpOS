import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Lead } from '../models/Lead.js';
import { Contact } from '../models/Contact.js';
import { Activity } from '../models/Activity.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { getAIProvider } from '../ai/index.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class ConversationService {
  /**
   * Get conversations for inbox
   */
  async getConversations(organizationId, filters = {}, pagination = {}) {
    const { status = 'open', channel, assignedTo, unreadOnly } = filters;
    const { page = 1, limit = 20 } = pagination;

    const query = { organizationId };
    if (status) query.status = status;
    if (channel) query.channel = channel;
    if (assignedTo) query.assignedTo = assignedTo;
    if (unreadOnly) query.unreadCount = { $gt: 0 };

    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate('contactId', 'fullName email phone company avatar')
        .populate('leadId', 'leadScore leadTemperature status estimatedValue')
        .populate('assignedTo', 'name avatar')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(query),
    ]);

    return { conversations, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get single conversation with messages
   */
  async getConversation(conversationId, organizationId) {
    const conversation = await Conversation.findOne({ _id: conversationId, organizationId })
      .populate('contactId')
      .populate('leadId')
      .populate('assignedTo', 'name avatar email');

    if (!conversation) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('senderId')
      .lean();

    // Mark as read
    await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0 });

    return { conversation, messages };
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId, organizationId, senderId, content, options = {}) {
    const conversation = await Conversation.findOne({ _id: conversationId, organizationId });
    if (!conversation) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');

    const { aiGenerated = false, messageType = 'text', channel } = options;

    const message = await Message.create({
      organizationId,
      conversationId,
      leadId: conversation.leadId,
      senderType: 'sales_rep',
      senderId,
      direction: 'outbound',
      channel: channel || conversation.channel,
      content,
      messageType,
      aiGenerated,
      deliveryStatus: 'sent',
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 100),
    });

    // Update lead last contact
    if (conversation.leadId) {
      await Lead.findByIdAndUpdate(conversation.leadId, {
        lastOutboundAt: new Date(),
        lastContactAt: new Date(),
      });
    }

    // Log activity
    await Activity.create({
      organizationId,
      leadId: conversation.leadId,
      contactId: conversation.contactId,
      userId: senderId,
      type: 'message_sent',
      title: `Message sent via ${conversation.channel}`,
      metadata: { channel: conversation.channel, aiGenerated },
    });

    logger.info('Message sent', { conversationId, senderId, aiGenerated });
    return message;
  }

  /**
   * Process an inbound message (from customer)
   */
  async receiveMessage(conversationId, organizationId, contactId, content, options = {}) {
    const conversation = await Conversation.findOne({ _id: conversationId, organizationId });
    if (!conversation) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');

    const message = await Message.create({
      organizationId,
      conversationId,
      leadId: conversation.leadId,
      senderType: 'customer',
      senderId: contactId,
      direction: 'inbound',
      channel: options.channel || conversation.channel,
      content,
      messageType: 'text',
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 100),
      $inc: { unreadCount: 1 },
    });

    // Update lead
    if (conversation.leadId) {
      await Lead.findByIdAndUpdate(conversation.leadId, {
        lastInboundAt: new Date(),
        lastContactAt: new Date(),
      });

      // Cancel pending follow-ups since customer replied
      await FollowUpTask.updateMany(
        { leadId: conversation.leadId, status: 'pending' },
        { 
          status: 'cancelled', 
          cancelledAt: new Date(), 
          cancelledReason: 'Customer replied' 
        }
      );

      logger.info('Pending follow-ups cancelled — customer replied', { leadId: conversation.leadId });
    }

    // Log activity
    await Activity.create({
      organizationId,
      leadId: conversation.leadId,
      contactId,
      type: 'message_received',
      title: `Customer message received via ${options.channel || conversation.channel}`,
    });

    return message;
  }

  /**
   * Generate AI reply for a conversation
   */
  async generateReply(conversationId, organizationId, organization, options = {}) {
    const conversation = await Conversation.findOne({ _id: conversationId, organizationId })
      .populate('contactId')
      .populate('leadId');

    if (!conversation) throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const ai = getAIProvider();
    
    const reply = await ai.generateReply({
      org: organization,
      lead: conversation.leadId,
      contact: conversation.contactId,
      messages,
      tone: options.tone || organization.settings?.defaultTone || 'professional',
      instruction: options.instruction,
    });

    return { reply, conversationId };
  }

  /**
   * Get or create conversation and messages by leadId
   */
  async getConversationByLeadId(leadId, organizationId) {
    let conversation = await Conversation.findOne({ leadId, organizationId })
      .populate('contactId')
      .populate('leadId')
      .populate('assignedTo', 'name avatar email');

    if (!conversation) {
      const lead = await Lead.findOne({ _id: leadId, organizationId });
      if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

      conversation = await Conversation.create({
        organizationId,
        leadId,
        contactId: lead.contactId,
        channel: lead.source === 'whatsapp' ? 'whatsapp' : lead.source === 'instagram' ? 'instagram' : 'email',
        status: ['won', 'lost'].includes(lead.status) ? 'closed' : 'open',
        lastMessageAt: new Date(),
      });
      await conversation.populate(['contactId', 'leadId']);
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .populate('senderId')
      .lean();

    return { conversation, messages };
  }

  /**
   * Send message by leadId
   */
  async sendMessageByLeadId(leadId, organizationId, senderId, content, options = {}) {
    const { conversation } = await this.getConversationByLeadId(leadId, organizationId);
    return this.sendMessage(conversation._id, organizationId, senderId, content, options);
  }
}

export const conversationService = new ConversationService();
export default conversationService;
