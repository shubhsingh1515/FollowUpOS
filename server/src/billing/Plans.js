/**
 * Centralized Plan Configurations
 * FollowUpOS commercial SaaS tiers
 */

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For solo sales professionals & small agencies',
    priceMonthly: 999, // ₹999/month
    priceAnnual: 799,  // ₹799/month billed annually
    currency: 'INR',
    limits: {
      monthlyLeads: 100,
      monthlyAIAnalyses: 150,
      monthlyAIMessages: 300,
      monthlyFollowups: 500,
      teamSeats: 1,
      leadForms: 2,
      integrations: 3
    },
    features: {
      AI_COPILOT: false,
      SMART_FOLLOWUPS: true,
      WHATSAPP_INTEGRATION: false,
      META_LEAD_ADS: false,
      ADVANCED_ANALYTICS: false,
      AUTOMATION_BUILDER: false,
      API_ACCESS: true,
      CSV_IMPORT: true,
      WHITE_LABEL: false,
      CUSTOM_SLA: false
    },
    providerPlanIds: {
      razorpay: {
        monthly: process.env.RAZORPAY_PLAN_STARTER_MONTHLY || 'plan_starter_monthly',
        annual: process.env.RAZORPAY_PLAN_STARTER_ANNUAL || 'plan_starter_annual'
      },
      stripe: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
        annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual'
      }
    }
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    tagline: 'For growing service teams closing deals daily',
    isPopular: true,
    priceMonthly: 2999, // ₹2,999/month
    priceAnnual: 2399,  // ₹2,399/month billed annually
    currency: 'INR',
    limits: {
      monthlyLeads: 1000,
      monthlyAIAnalyses: 1500,
      monthlyAIMessages: 3000,
      monthlyFollowups: 5000,
      teamSeats: 5,
      leadForms: 10,
      integrations: 10
    },
    features: {
      AI_COPILOT: true,
      SMART_FOLLOWUPS: true,
      WHATSAPP_INTEGRATION: true,
      META_LEAD_ADS: true,
      ADVANCED_ANALYTICS: true,
      AUTOMATION_BUILDER: true,
      API_ACCESS: true,
      CSV_IMPORT: true,
      WHITE_LABEL: false,
      CUSTOM_SLA: false
    },
    providerPlanIds: {
      razorpay: {
        monthly: process.env.RAZORPAY_PLAN_GROWTH_MONTHLY || 'plan_growth_monthly',
        annual: process.env.RAZORPAY_PLAN_GROWTH_ANNUAL || 'plan_growth_annual'
      },
      stripe: {
        monthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY || 'price_growth_monthly',
        annual: process.env.STRIPE_PRICE_GROWTH_ANNUAL || 'price_growth_annual'
      }
    }
  },
  agency: {
    id: 'agency',
    name: 'Agency / Enterprise',
    tagline: 'For high-velocity sales organizations & multi-brand agencies',
    priceMonthly: 7999, // ₹7,999/month
    priceAnnual: 6399,  // ₹6,399/month billed annually
    currency: 'INR',
    limits: {
      monthlyLeads: 5000,
      monthlyAIAnalyses: 10000,
      monthlyAIMessages: 20000,
      monthlyFollowups: 30000,
      teamSeats: 25,
      leadForms: 50,
      integrations: 50
    },
    features: {
      AI_COPILOT: true,
      SMART_FOLLOWUPS: true,
      WHATSAPP_INTEGRATION: true,
      META_LEAD_ADS: true,
      ADVANCED_ANALYTICS: true,
      AUTOMATION_BUILDER: true,
      API_ACCESS: true,
      CSV_IMPORT: true,
      WHITE_LABEL: true,
      CUSTOM_SLA: true
    },
    providerPlanIds: {
      razorpay: {
        monthly: process.env.RAZORPAY_PLAN_AGENCY_MONTHLY || 'plan_agency_monthly',
        annual: process.env.RAZORPAY_PLAN_AGENCY_ANNUAL || 'plan_agency_annual'
      },
      stripe: {
        monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY || 'price_agency_monthly',
        annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL || 'price_agency_annual'
      }
    }
  }
};

export const TRIAL_CONFIG = {
  defaultTrialDays: parseInt(process.env.TRIAL_DAYS || '7', 10),
  trialPlan: 'growth',
  gracePeriodDays: 3
};

export function getPlan(planId) {
  const normalized = (planId || 'starter').toLowerCase();
  return PLANS[normalized] || PLANS.starter;
}

export function getAllPlans() {
  return Object.values(PLANS);
}

export default {
  PLANS,
  TRIAL_CONFIG,
  getPlan,
  getAllPlans
};
