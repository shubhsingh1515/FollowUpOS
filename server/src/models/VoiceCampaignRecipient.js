import mongoose from 'mongoose';

const voiceCampaignRecipientSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceCampaign',
    required: true,
    index: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'called', 'completed', 'failed'],
    default: 'pending',
    index: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastCallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceCall',
  },
}, { timestamps: true });

voiceCampaignRecipientSchema.index({ campaignId: 1, leadId: 1 });
voiceCampaignRecipientSchema.index({ organizationId: 1, campaignId: 1 });

export const VoiceCampaignRecipient = mongoose.model('VoiceCampaignRecipient', voiceCampaignRecipientSchema);
export default VoiceCampaignRecipient;
