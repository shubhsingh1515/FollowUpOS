import { billingService } from '../billing/BillingService.js';
import { usageService } from '../billing/UsageService.js';
import { getAllPlans, getPlan } from '../billing/Plans.js';
import { Organization } from '../models/Organization.js';

export const getCurrentBilling = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const subscription = await billingService.getOrCreateSubscription(orgId);
    const usage = await usageService.getUsage(orgId);
    const invoices = await billingService.getInvoices(orgId);
    const plan = getPlan(subscription.plan);

    res.json({
      success: true,
      subscription,
      plan,
      usage,
      invoices
    });
  } catch (err) {
    next(err);
  }
};

export const getPlans = (req, res) => {
  res.json({
    success: true,
    plans: getAllPlans()
  });
};

export const createCheckout = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;
    const org = await Organization.findById(req.organizationId);

    const checkoutData = await billingService.createCheckout({
      organization: org,
      user: req.user,
      planId: planId || 'growth',
      billingCycle: billingCycle || 'monthly'
    });

    res.json({
      success: true,
      data: checkoutData
    });
  } catch (err) {
    next(err);
  }
};

export const changePlan = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;
    const sub = await billingService.changePlan(req.organizationId, planId, billingCycle);
    res.json({
      success: true,
      message: `Plan changed to ${planId}`,
      subscription: sub
    });
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { atPeriodEnd = true, reason = '' } = req.body;
    const sub = await billingService.cancelSubscription(req.organizationId, atPeriodEnd, reason);
    res.json({
      success: true,
      message: atPeriodEnd ? 'Subscription will cancel at end of billing cycle' : 'Subscription cancelled',
      subscription: sub
    });
  } catch (err) {
    next(err);
  }
};

export const getUsage = async (req, res, next) => {
  try {
    const usage = await usageService.getUsage(req.organizationId);
    res.json({
      success: true,
      data: usage
    });
  } catch (err) {
    next(err);
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await billingService.getInvoices(req.organizationId);
    res.json({
      success: true,
      invoices
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getCurrentBilling,
  getPlans,
  createCheckout,
  changePlan,
  cancelSubscription,
  getUsage,
  getInvoices
};
