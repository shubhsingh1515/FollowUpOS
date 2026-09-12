import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  title: { type: String, trim: true },
  description: String,

  source: {
    type: String,
    default: 'manual',
    index: true,
  },
  sourceMetadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },

  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'meeting_scheduled', 'proposal', 'negotiation', 'won', 'lost', 'closed'],
    default: 'new',
    index: true,
  },
  stage: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'meeting_scheduled', 'proposal', 'negotiation', 'won', 'lost', 'closed'],
    default: 'new',
  },

  leadScore: { type: Number, default: 0, min: 0, max: 100, index: true },
  leadTemperature: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'cold',
    index: true,
  },

  intent: {
    type: String,
    default: 'unknown',
  },
  intentConfidence: { type: Number, min: 0, max: 1, default: 0 },

  urgency: {
    type: String,
    enum: ['urgent', 'medium', 'low'],
    default: 'medium',
  },

  budget: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    period: String,
  },

  timeline: String,
  summary: String,
  recommendedAction: String,
  suggestedReply: String,

  aiScoreExplanation: [String],
  keyBuyingSignals: [String],
  riskFactors: [String],

  scoreHistory: [{
    score: Number,
    temperature: String,
    reason: String,
    changedAt: { type: Date, default: Date.now },
  }],

  lastScoredAt: Date,
  lastContactedAt: Date,
  nextFollowUpAt: Date,
  followUpCount: { type: Number, default: 0 },

  isArchived: { type: Boolean, default: false },
  tags: [String],
}, {
  timestamps: true,
});

leadSchema.index({ organizationId: 1, status: 1 });
leadSchema.index({ organizationId: 1, leadScore: -1 });
leadSchema.index({ organizationId: 1, createdAt: -1 });

export const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
