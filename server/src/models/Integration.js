import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  event: { type: String, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  statusCode: { type: Number, default: 200 },
  payloadPreview: { type: String },
  error: { type: String },
}, { _id: false });

const integrationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: [
      'email',
      'gmail',
      'whatsapp',
      'meta_lead_ads',
      'facebook',
      'instagram',
      'linkedin',
      'calendly',
      'google_forms',
      'custom_webhook',
      'openai',
      'stripe',
      'razorpay'
    ],
    required: true,
  },
  type: {
    type: String,
    enum: ['messaging', 'email', 'calendar', 'forms', 'payment', 'social', 'ai', 'webhook'],
    default: 'messaging',
  },
  status: {
    type: String,
    enum: ['not_connected', 'configuration_required', 'connecting', 'connected', 'error', 'disconnected'],
    default: 'not_connected',
    index: true,
  },
  // AES-256-GCM Encrypted JSON string of customer credentials (never sent to frontend)
  encryptedCredentials: {
    type: String,
    select: false,
  },
  // Masked credentials safe for frontend display (e.g. "sk-••••••••abcd")
  maskedCredentials: {
    type: Map,
    of: String,
    default: () => new Map(),
  },
  accountIdentifier: {
    type: String,
    trim: true,
  },
  lastVerifiedAt: {
    type: Date,
  },
  lastError: {
    code: { type: String },
    message: { type: String },
    timestamp: { type: Date },
  },
  // Recent delivery audit trail for webhooks and outbound syncs
  recentDeliveries: {
    type: [deliverySchema],
    default: [],
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => new Map(),
  },
  lastSyncAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

integrationSchema.index({ organizationId: 1, provider: 1 }, { unique: true });

export const Integration = mongoose.model('Integration', integrationSchema);
export default Integration;
