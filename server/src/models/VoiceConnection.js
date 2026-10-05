import mongoose from 'mongoose';

const voiceConnectionSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['telnyx', 'twilio', 'mock'],
    default: 'telnyx',
    required: true,
  },
  accountId: {
    type: String,
  },
  apiKey: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active',
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

export const VoiceConnection = mongoose.model('VoiceConnection', voiceConnectionSchema);
export default VoiceConnection;
