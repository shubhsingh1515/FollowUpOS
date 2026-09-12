import crypto from 'crypto';
import { BillingProvider } from './BillingProvider.js';
import { getPlan } from './Plans.js';

export class RazorpayBillingProvider extends BillingProvider {
  constructor() {
    super();
    this.keyId = process.env.RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    this.isConfigured = Boolean(this.keyId && this.keySecret);
  }

  getAuthHeader() {
    return 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async createCheckout({ organization, user, planId, billingCycle = 'monthly' }) {
    if (!this.isConfigured) {
      throw new Error('Razorpay credentials not configured in environment variables');
    }

    const planConfig = getPlan(planId);
    const razorpayPlanId = planConfig.providerPlanIds.razorpay[billingCycle];

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader()
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId || `plan_${planId}_${billingCycle}`,
        total_count: billingCycle === 'annual' ? 5 : 60,
        quantity: 1,
        customer_notify: 1,
        notes: {
          organizationId: organization._id.toString(),
          userId: user._id.toString(),
          plan: planId,
          billingCycle
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.description || 'Failed to create Razorpay subscription');
    }

    return {
      provider: 'razorpay',
      subscriptionId: data.id,
      keyId: this.keyId,
      amount: billingCycle === 'annual' ? planConfig.priceAnnual * 12 * 100 : planConfig.priceMonthly * 100,
      currency: 'INR',
      name: 'FollowUpOS',
      description: `${planConfig.name} Plan (${billingCycle})`,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || ''
      },
      notes: {
        organizationId: organization._id.toString(),
        planId,
        billingCycle
      }
    };
  }

  verifyWebhookSignature(rawBody, signature, secret) {
    const webhookSecret = secret || this.webhookSecret;
    if (!webhookSecret) return false;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature || '', 'utf8')
    );
  }

  async processWebhook(eventData) {
    const event = eventData.event;
    const payload = eventData.payload;

    let normalized = {
      provider: 'razorpay',
      eventId: eventData.account_id ? `${eventData.account_id}_${Date.now()}` : `rzp_${Date.now()}`,
      eventType: event,
      providerSubscriptionId: null,
      organizationId: null,
      plan: null,
      status: null,
      currentPeriodEnd: null,
      amount: null
    };

    if (payload.subscription?.entity) {
      const sub = payload.subscription.entity;
      normalized.providerSubscriptionId = sub.id;
      normalized.organizationId = sub.notes?.organizationId;
      normalized.plan = sub.notes?.plan;
      normalized.currentPeriodEnd = sub.current_end ? new Date(sub.current_end * 1000) : null;
      
      switch (event) {
        case 'subscription.authenticated':
        case 'subscription.activated':
        case 'subscription.charged':
          normalized.status = 'active';
          break;
        case 'subscription.paused':
          normalized.status = 'paused';
          break;
        case 'subscription.resumed':
          normalized.status = 'active';
          break;
        case 'subscription.cancelled':
          normalized.status = 'cancelled';
          break;
        case 'subscription.pending':
          normalized.status = 'incomplete';
          break;
        case 'subscription.halted':
          normalized.status = 'past_due';
          break;
      }
    } else if (payload.payment?.entity) {
      const payment = payload.payment.entity;
      if (event === 'payment.failed') {
        normalized.status = 'payment_failed';
        normalized.organizationId = payment.notes?.organizationId;
      }
    }

    return normalized;
  }

  async cancelSubscription(providerSubscriptionId, atPeriodEnd = true) {
    if (!this.isConfigured) return { success: true };

    const response = await fetch(`https://api.razorpay.com/v1/subscriptions/${providerSubscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader()
      },
      body: JSON.stringify({
        cancel_at_cycle_end: atPeriodEnd ? 1 : 0
      })
    });

    return await response.json();
  }

  async changeSubscriptionPlan(providerSubscriptionId, newPlanId, billingCycle = 'monthly') {
    if (!this.isConfigured) return { success: true };

    const planConfig = getPlan(newPlanId);
    const razorpayPlanId = planConfig.providerPlanIds.razorpay[billingCycle];

    const response = await fetch(`https://api.razorpay.com/v1/subscriptions/${providerSubscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader()
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        quantity: 1,
        remaining_count: billingCycle === 'annual' ? 5 : 60
      })
    });

    return await response.json();
  }

  async getInvoices(providerCustomerId) {
    if (!this.isConfigured) return [];
    try {
      const response = await fetch(`https://api.razorpay.com/v1/invoices?customer_id=${providerCustomerId}`, {
        headers: { 'Authorization': this.getAuthHeader() }
      });
      const data = await response.json();
      return data.items || [];
    } catch {
      return [];
    }
  }
}

export default RazorpayBillingProvider;
