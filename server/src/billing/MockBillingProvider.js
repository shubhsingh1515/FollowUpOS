import { BillingProvider } from './BillingProvider.js';
import { getPlan } from './Plans.js';

export class MockBillingProvider extends BillingProvider {
  constructor() {
    super();
    this.name = 'mock';
  }

  async createCheckout({ organization, user, planId, billingCycle = 'monthly' }) {
    const planConfig = getPlan(planId);
    const mockSubId = `mock_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      provider: 'mock',
      subscriptionId: mockSubId,
      keyId: 'mock_key_id_followupos',
      amount: billingCycle === 'annual' ? planConfig.priceAnnual * 12 * 100 : planConfig.priceMonthly * 100,
      currency: 'INR',
      name: 'FollowUpOS (Demo / Dev)',
      description: `${planConfig.name} Plan (${billingCycle})`,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || '+91 98765 43210'
      },
      notes: {
        organizationId: organization._id.toString(),
        planId,
        billingCycle
      }
    };
  }

  verifyWebhookSignature(rawBody, signature, secret) {
    return true;
  }

  async processWebhook(eventData) {
    const event = eventData.event || 'subscription.activated';
    const subId = eventData.subscriptionId || `mock_sub_${Date.now()}`;
    const plan = eventData.plan || 'growth';

    return {
      provider: 'mock',
      eventId: eventData.eventId || `mock_evt_${Date.now()}`,
      eventType: event,
      providerSubscriptionId: subId,
      organizationId: eventData.organizationId,
      plan,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: getPlan(plan).priceMonthly
    };
  }

  async cancelSubscription(providerSubscriptionId, atPeriodEnd = true) {
    return {
      success: true,
      status: atPeriodEnd ? 'active_until_period_end' : 'cancelled',
      cancelledAt: new Date()
    };
  }

  async changeSubscriptionPlan(providerSubscriptionId, newPlanId, billingCycle = 'monthly') {
    return {
      success: true,
      newPlanId,
      billingCycle,
      effectiveAt: new Date()
    };
  }

  async getInvoices(providerCustomerId) {
    return [
      {
        id: 'inv_mock_001',
        number: 'FUP-2026-001',
        amount: 299900,
        currency: 'INR',
        status: 'paid',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'inv_mock_002',
        number: 'FUP-2026-002',
        amount: 299900,
        currency: 'INR',
        status: 'paid',
        date: new Date().toISOString()
      }
    ];
  }
}

export default MockBillingProvider;
