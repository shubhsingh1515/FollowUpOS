import mongoose from 'mongoose';

const voiceCallSchema = new mongoose.Schema({
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
  providerCallId: {
    type: String,
    index: true,
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true,
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer'],
    default: 'initiated',
    index: true,
  },
  fromNumber: {
    type: String,
    required: true,
  },
  toNumber: {
    type: String,
    required: true,
  },
  outcome: {
    type: String,
  },
  transcript: {
    type: String,
  },
  extractedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  duration: {
    type: Number,
  },
  cost: {
    type: Number,
  },
}, { timestamps: true });

voiceCallSchema.index({ organizationId: 1, leadId: 1 });

export const VoiceCall = mongoose.model('VoiceCall', voiceCallSchema);
export default VoiceCall;
