import { RazorpayBillingProvider } from './RazorpayBillingProvider.js';
import { MockBillingProvider } from './MockBillingProvider.js';
import { getPlan, PLANS, TRIAL_CONFIG } from './Plans.js';
import { Subscription } from '../models/Subscription.js';
import { Organization } from '../models/Organization.js';
import { WebhookEvent } from '../models/WebhookEvent.js';

export class BillingService {
  constructor() {
    this.razorpayProvider = new RazorpayBillingProvider();
    this.mockProvider = new MockBillingProvider();
  }

  getProvider() {
    if (this.razorpayProvider.isConfigured && process.env.DEMO_MODE !== 'true') {
      return this.razorpayProvider;
    }
    return this.mockProvider;
  }

  async getOrCreateSubscription(organizationId) {
    let sub = await Subscription.findOne({ organizationId });
    if (!sub) {
      const trialDays = TRIAL_CONFIG.defaultTrialDays;
      const trialEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
      
      sub = await Subscription.create({
        organizationId,
        provider: 'mock',
        plan: TRIAL_CONFIG.trialPlan,
        status: 'trialing',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEnd,
        trialStart: new Date(),
        trialEnd: trialEnd,
        amount: getPlan(TRIAL_CONFIG.trialPlan).priceMonthly
      });
    }
    return sub;
  }

  async createCheckout({ organization, user, planId, billingCycle = 'monthly' }) {
    const provider = this.getProvider();
    const planConfig = getPlan(planId);

    const checkoutData = await provider.createCheckout({
      organization,
      user,
      planId,
      billingCycle
    });

    await Subscription.findOneAndUpdate(
      { organizationId: organization._id },
      {
        provider: provider.name || 'razorpay',
        providerSubscriptionId: checkoutData.subscriptionId,
        plan: planId,
        billingCycle,
        amount: billingCycle === 'annual' ? planConfig.priceAnnual * 12 : planConfig.priceMonthly,
        status: 'incomplete'
      },
      { upsert: true, new: true }
    );

    return checkoutData;
  }

  async handleWebhook(providerName, rawBody, signature, payload) {
    const provider = providerName === 'razorpay' ? this.razorpayProvider : this.mockProvider;

    const isValid = provider.verifyWebhookSignature(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      throw new Error('Invalid webhook signature');
    }

    const normalized = await provider.processWebhook(payload);
    const existingEvent = await WebhookEvent.findOne({
      provider: providerName,
      eventId: normalized.eventId
    });

    if (existingEvent && existingEvent.status === 'processed') {
      return { status: 'already_processed', eventId: normalized.eventId };
    }

    const eventRecord = await WebhookEvent.findOneAndUpdate(
      { provider: providerName, eventId: normalized.eventId },
      {
        provider: providerName,
        eventType: normalized.eventType,
        organizationId: normalized.organizationId,
        status: 'processing',
        payload
      },
      { upsert: true, new: true }
    );

    try {
      if (normalized.organizationId || normalized.providerSubscriptionId) {
        const query = normalized.organizationId
          ? { organizationId: normalized.organizationId }
          : { providerSubscriptionId: normalized.providerSubscriptionId };

        const updateData = {};
        if (normalized.status) updateData.status = normalized.status;
        if (normalized.plan) updateData.plan = normalized.plan;
        if (normalized.currentPeriodEnd) updateData.currentPeriodEnd = normalized.currentPeriodEnd;
        if (normalized.providerSubscriptionId) updateData.providerSubscriptionId = normalized.providerSubscriptionId;

        const sub = await Subscription.findOneAndUpdate(query, updateData, { new: true, upsert: true });

        if (sub && normalized.plan) {
          await Organization.findByIdAndUpdate(sub.organizationId, {
            plan: normalized.plan,
            'settings.subscriptionStatus': normalized.status || 'active'
          });
        }
      }

      await WebhookEvent.findByIdAndUpdate(eventRecord._id, {
        status: 'processed',
        processedAt: new Date()
      });

      return { status: 'success', eventId: normalized.eventId };
    } catch (err) {
      await WebhookEvent.findByIdAndUpdate(eventRecord._id, {
        status: 'failed',
        errorMessage: err.message
      });
      throw err;
    }
  }

  async cancelSubscription(organizationId, atPeriodEnd = true, reason = '') {
    const sub = await Subscription.findOne({ organizationId });
    if (!sub) throw new Error('Subscription not found');

    const provider = sub.provider === 'razorpay' ? this.razorpayProvider : this.mockProvider;
    if (sub.providerSubscriptionId) {
      await provider.cancelSubscription(sub.providerSubscriptionId, atPeriodEnd);
    }

    sub.cancelAtPeriodEnd = atPeriodEnd;
    sub.cancelledAt = new Date();
    sub.cancellationReason = reason;
    if (!atPeriodEnd) {
      sub.status = 'cancelled';
    }
    await sub.save();

    return sub;
  }

  async changePlan(organizationId, newPlanId, billingCycle = 'monthly') {
    const sub = await Subscription.findOne({ organizationId });
    if (!sub) throw new Error('Subscription not found');

    const planConfig = getPlan(newPlanId);
    const provider = sub.provider === 'razorpay' ? this.razorpayProvider : this.mockProvider;

    if (sub.providerSubscriptionId) {
      await provider.changeSubscriptionPlan(sub.providerSubscriptionId, newPlanId, billingCycle);
    }

    sub.plan = newPlanId;
    sub.billingCycle = billingCycle;
    sub.amount = billingCycle === 'annual' ? planConfig.priceAnnual * 12 : planConfig.priceMonthly;
    sub.status = 'active';
    await sub.save();

    await Organization.findByIdAndUpdate(organizationId, {
      plan: newPlanId,
      'settings.subscriptionStatus': 'active'
    });

    return sub;
  }

  async getInvoices(organizationId) {
    const sub = await Subscription.findOne({ organizationId });
    if (!sub) return [];
    const provider = sub.provider === 'razorpay' ? this.razorpayProvider : this.mockProvider;
    return await provider.getInvoices(sub.providerCustomerId || sub.providerSubscriptionId);
  }

  async calculateMRR() {
    const activeSubs = await Subscription.find({
      status: { $in: ['active', 'trialing'] }
    });

    let totalMRR = 0;
    for (const sub of activeSubs) {
      const plan = getPlan(sub.plan);
      if (sub.billingCycle === 'annual') {
        totalMRR += plan.priceAnnual;
      } else {
        totalMRR += plan.priceMonthly;
      }
    }
    return totalMRR;
  }
}

export const billingService = new BillingService();
export default billingService;
