import mongoose from 'mongoose';

const followUpTaskSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  sequenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FollowUpSequence',
  },
  stepNumber: { type: Number, default: 1 },

  type: {
    type: String,
    enum: ['auto_followup', 'manual_reminder', 'meeting_reminder', 'custom'],
    default: 'auto_followup',
  },

  scheduledAt: { type: Date, required: true, index: true },

  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'failed'],
    default: 'pending',
    index: true,
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  message: String,
  aiGenerated: { type: Boolean, default: false },

  completedAt: Date,
  cancelledAt: Date,
  cancelledReason: String,
  failedReason: String,

  // Idempotency key to prevent duplicate sends
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

followUpTaskSchema.index({ organizationId: 1, scheduledAt: 1, status: 1 });
followUpTaskSchema.index({ leadId: 1, status: 1 });

export const FollowUpTask = mongoose.model('FollowUpTask', followUpTaskSchema);
export default FollowUpTask;
