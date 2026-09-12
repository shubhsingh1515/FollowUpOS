/**
 * BillingProvider Interface
 * Base class for all billing providers (Razorpay, Stripe, Mock)
 */

export class BillingProvider {
  /**
   * Create a checkout session / subscription order
   * @param {Object} params - { organization, user, plan, billingCycle }
   * @returns {Promise<Object>} checkout payload for frontend
   */
  async createCheckout(params) {
    throw new Error('Method createCheckout() not implemented');
  }

  /**
   * Verify webhook signature
   * @param {string|Buffer} rawBody
   * @param {string} signature
   * @param {string} secret
   * @returns {boolean}
   */
  verifyWebhookSignature(rawBody, signature, secret) {
    throw new Error('Method verifyWebhookSignature() not implemented');
  }

  /**
   * Process provider webhook event
   * @param {Object} eventData
   * @returns {Promise<Object>} normalized event result
   */
  async processWebhook(eventData) {
    throw new Error('Method processWebhook() not implemented');
  }

  /**
   * Cancel subscription
   * @param {string} providerSubscriptionId
   * @param {boolean} atPeriodEnd
   * @returns {Promise<Object>}
   */
  async cancelSubscription(providerSubscriptionId, atPeriodEnd = true) {
    throw new Error('Method cancelSubscription() not implemented');
  }

  /**
   * Upgrade or downgrade plan
   * @param {string} providerSubscriptionId
   * @param {string} newPlanId
   * @param {string} billingCycle
   * @returns {Promise<Object>}
   */
  async changeSubscriptionPlan(providerSubscriptionId, newPlanId, billingCycle = 'monthly') {
    throw new Error('Method changeSubscriptionPlan() not implemented');
  }

  /**
   * Fetch customer invoices
   * @param {string} providerCustomerId
   * @returns {Promise<Array>}
   */
  async getInvoices(providerCustomerId) {
    throw new Error('Method getInvoices() not implemented');
  }
}

export default BillingProvider;
