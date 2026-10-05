import mongoose from 'mongoose';

const voiceCampaignSchema = new mongoose.Schema({
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
  voiceAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceAgent',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true,
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    businessHoursOnly: { type: Boolean, default: true },
  },
  maxAttempts: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

export const VoiceCampaign = mongoose.model('VoiceCampaign', voiceCampaignSchema);
export default VoiceCampaign;
