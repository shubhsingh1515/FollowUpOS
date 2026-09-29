import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    targetAudience: { type: String },
    leadCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'draft', 'paused', 'completed'], default: 'draft' },
    responseRate: { type: Number, default: 0 },
    aiStrategy: { type: String },
    templateMessage: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

campaignSchema.index({ organizationId: 1, status: 1 });

export const Campaign = mongoose.model('Campaign', campaignSchema);
