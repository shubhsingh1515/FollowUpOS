import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  delay: { type: Number, default: 0 },
  delayUnit: {
    type: String,
    enum: ['minutes', 'hours', 'days'],
    default: 'hours',
  },
  messageTemplate: String,
  useAI: { type: Boolean, default: true },
  requireApproval: { type: Boolean, default: true },
  name: String,
}, { _id: false });

const followUpSequenceSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  name: { type: String, required: true },
  description: String,
  steps: [stepSchema],
  active: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export const FollowUpSequence = mongoose.model('FollowUpSequence', followUpSequenceSchema);
export default FollowUpSequence;
