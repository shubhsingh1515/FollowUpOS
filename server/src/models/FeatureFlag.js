import mongoose from 'mongoose';

const featureFlagSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isEnabledGlobal: {
    type: Boolean,
    default: true
  },
  allowedPlans: [{
    type: String,
    enum: ['starter', 'growth', 'agency']
  }],
  enabledOrgIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }],
  disabledOrgIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }]
}, {
  timestamps: true
});

export const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);
export default FeatureFlag;
