import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    index: true,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  channel: {
    type: String,
    enum: ['website', 'website_form', 'whatsapp', 'instagram', 'facebook', 'meta_lead_ads', 'linkedin', 'email', 'google_forms', 'calendly', 'inbound_webhook', 'api', 'manual', 'other'],
    default: 'manual',
  },
  subject: String,
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['agent', 'contact'] },
  }],
  lastMessageAt: { type: Date, default: Date.now, index: true },
  lastMessagePreview: String,
  unreadCount: { type: Number, default: 0 },
  aiEnabled: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['open', 'closed', 'snoozed'],
    default: 'open',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

conversationSchema.index({ organizationId: 1, lastMessageAt: -1 });
conversationSchema.index({ organizationId: 1, status: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
