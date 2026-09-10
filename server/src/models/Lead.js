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
    enum: ['website', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'email', 'google_forms', 'calendly', 'manual', 'csv', 'other'],
    default: 'manual',
    index: true,
  },
  sourceMetadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },

  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new',
    index: true,
  },
  stage: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
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
    enum: ['purchase', 'inquiry', 'research', 'comparison', 'support', 'unknown'],
    default: 'unknown',
  },
  intentConfidence: { type: Number, min: 0, max: 1, default: 0 },

  estimatedValue: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },

  industry: String,
  companySize: String,
  budget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' },
  },
  timeline: String,
  service: String,

  aiSummary: String,
  aiInsights: [String],
  aiRecommendations: [String],
  recommendedAction: String,

  lastContactAt: Date,
  lastInboundAt: Date,
  lastOutboundAt: Date,

  nextFollowUpAt: { type: Date, index: true },
  followUpCount: { type: Number, default: 0 },

  isQualified: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false, index: true },

  tags: [{ type: String, trim: true }],
  notes: String,

  lastAnalyzedAt: Date,
}, {
  timestamps: true,
});

// Compound indexes for common queries
leadSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
leadSchema.index({ organizationId: 1, leadScore: -1 });
leadSchema.index({ organizationId: 1, nextFollowUpAt: 1, isArchived: 1 });
leadSchema.index({ organizationId: 1, ownerId: 1, status: 1 });

export const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
