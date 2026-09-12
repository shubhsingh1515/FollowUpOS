import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  size: Number,
}, { _id: false });

const messageSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    index: true,
  },
  senderType: {
    type: String,
    enum: ['customer', 'sales_rep', 'ai', 'system'],
    required: true,
  },
  senderId: mongoose.Schema.Types.ObjectId, // userId or contactId

  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true,
  },

  channel: {
    type: String,
    enum: ['website', 'website_form', 'whatsapp', 'instagram', 'facebook', 'meta_lead_ads', 'linkedin', 'email', 'google_forms', 'calendly', 'inbound_webhook', 'api', 'manual', 'other'],
    default: 'manual',
  },

  content: {
    type: String,
    required: true,
  },
  attachments: [attachmentSchema],

  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'template', 'note'],
    default: 'text',
  },

  aiGenerated: { type: Boolean, default: false },
  aiConfidence: { type: Number, min: 0, max: 1 },

  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent',
  },
  readAt: Date,

  externalMessageId: String, // ID from WhatsApp/Meta/etc
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ organizationId: 1, leadId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
export default Message;
