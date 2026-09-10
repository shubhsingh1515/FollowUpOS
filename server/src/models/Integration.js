import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['email', 'gmail', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'calendly', 'google_forms', 'stripe'],
    required: true,
  },
  type: {
    type: String,
    enum: ['messaging', 'email', 'calendar', 'forms', 'payment', 'social'],
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'pending'],
    default: 'disconnected',
  },
  // Encrypted tokens — never expose to frontend
  accessToken: { type: String, select: false },
  refreshToken: { type: String, select: false },
  expiresAt: Date,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  lastSyncAt: Date,
  errorMessage: String,
}, {
  timestamps: true,
});

integrationSchema.index({ organizationId: 1, provider: 1 }, { unique: true });

export const Integration = mongoose.model('Integration', integrationSchema);
export default Integration;
