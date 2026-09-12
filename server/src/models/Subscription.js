import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['razorpay', 'stripe', 'mock', 'manual'],
    default: 'mock',
    required: true
  },
  providerCustomerId: {
    type: String,
    trim: true
  },
  providerSubscriptionId: {
    type: String,
    trim: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['starter', 'growth', 'agency'],
    default: 'growth',
    required: true
  },
  status: {
    type: String,
    enum: [
      'trialing',
      'active',
      'past_due',
      'paused',
      'cancelled',
      'expired',
      'incomplete',
      'payment_failed'
    ],
    default: 'trialing',
    index: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  amount: {
    type: Number,
    default: 2999
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  trialStart: {
    type: Date,
    default: Date.now
  },
  trialEnd: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  paymentMethod: {
    type: {
      type: String
    },
    last4: String,
    network: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ organizationId: 1, status: 1 });
subscriptionSchema.index({ provider: 1, providerSubscriptionId: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
