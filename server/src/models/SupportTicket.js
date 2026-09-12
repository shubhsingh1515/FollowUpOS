import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  category: {
    type: String,
    enum: ['billing', 'leads_ingestion', 'ai_copilot', 'whatsapp', 'feature_request', 'bug_report', 'other'],
    default: 'other'
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  responses: [
    {
      senderType: {
        type: String,
        enum: ['customer', 'admin'],
        required: true
      },
      senderName: String,
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

supportTicketSchema.index({ organizationId: 1, status: 1 });
supportTicketSchema.index({ createdAt: -1 });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
