import mongoose from 'mongoose';

const voiceAgentSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  voiceId: {
    type: String,
  },
  language: {
    type: String,
    default: 'en-US',
  },
  instructions: {
    type: String,
  },
  tools: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const VoiceAgent = mongoose.model('VoiceAgent', voiceAgentSchema);
export default VoiceAgent;
