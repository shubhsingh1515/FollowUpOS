import mongoose from 'mongoose';

const voicePhoneNumberSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  voiceAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAgent',
  },
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  provider: {
    type: String,
    default: 'telnyx',
  },
  providerNumberId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'unassigned'],
    default: 'unassigned',
  },
}, { timestamps: true });

voicePhoneNumberSchema.index({ organizationId: 1, phoneNumber: 1 });

export const VoicePhoneNumber = mongoose.model('VoicePhoneNumber', voicePhoneNumberSchema);
export default VoicePhoneNumber;
