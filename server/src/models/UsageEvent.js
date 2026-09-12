import mongoose from 'mongoose';

const usageEventSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'LEAD_CREATED',
      'AI_ANALYSIS',
      'AI_MESSAGE',
      'FOLLOWUP_SENT',
      'TEAM_MEMBER_ADDED',
      'API_REQUEST',
      'LEAD_FORM_SUBMIT',
      'WHATSAPP_MESSAGE_SENT'
    ],
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  costEstimate: {
    type: Number,
    default: 0
  },
  tokensInput: {
    type: Number,
    default: 0
  },
  tokensOutput: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  billingPeriod: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

usageEventSchema.index({ organizationId: 1, type: 1, billingPeriod: 1 });
usageEventSchema.index({ organizationId: 1, createdAt: -1 });

export const UsageEvent = mongoose.model('UsageEvent', usageEventSchema);
export default UsageEvent;
