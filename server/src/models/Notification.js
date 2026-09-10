import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'hot_lead', 'followup_overdue', 'customer_replied',
      'meeting_booked', 'deal_won', 'lead_assigned',
      'team_invite', 'system', 'daily_summary',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: String,
  read: { type: Boolean, default: false, index: true },
  link: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
