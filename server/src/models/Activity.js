import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
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
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: [
      'lead_created', 'lead_assigned', 'lead_stage_changed', 'lead_score_changed',
      'lead_won', 'lead_lost', 'lead_archived',
      'email_received', 'email_sent',
      'whatsapp_received', 'whatsapp_sent',
      'instagram_received', 'instagram_sent',
      'message_received', 'message_sent',
      'ai_analyzed', 'ai_reply_generated',
      'followup_scheduled', 'followup_sent', 'followup_cancelled',
      'meeting_booked', 'deal_created', 'deal_won', 'deal_lost',
      'note_added', 'tag_added', 'integration_connected',
      'contact_created', 'contact_updated',
    ],
    required: true,
  },
  title: { type: String, required: true },
  description: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  icon: String,
}, {
  timestamps: true,
});

activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ organizationId: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
