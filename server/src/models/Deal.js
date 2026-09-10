import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: { type: String, required: true },
  value: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  stage: {
    type: String,
    enum: ['qualification', 'proposal', 'negotiation', 'contract', 'won', 'lost'],
    default: 'qualification',
  },
  probability: { type: Number, min: 0, max: 100, default: 10 },
  expectedCloseDate: Date,
  wonAt: Date,
  lostAt: Date,
  lostReason: String,
  notes: String,
}, {
  timestamps: true,
});

dealSchema.index({ organizationId: 1, stage: 1 });

export const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
