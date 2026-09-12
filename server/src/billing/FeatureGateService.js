import { Organization } from '../models/Organization.js';
import { Subscription } from '../models/Subscription.js';
import { getPlan } from './Plans.js';
import { usageService } from './UsageService.js';

export class FeatureGateService {
  async canUseFeature(organizationId, featureName) {
    const sub = await Subscription.findOne({ organizationId });
    const org = await Organization.findById(organizationId);
    
    const validStatuses = ['active', 'trialing'];
    const currentStatus = sub?.status || 'trialing';
    
    if (!validStatuses.includes(currentStatus)) {
      return false;
    }

    const plan = getPlan(sub?.plan || org?.plan || 'starter');
    return Boolean(plan.features[featureName]);
  }

  async canCreateLead(organizationId) {
    const sub = await Subscription.findOne({ organizationId });
    if (sub && ['cancelled', 'expired', 'payment_failed'].includes(sub.status)) {
      return { allowed: false, reason: 'Subscription is not active' };
    }

    const withinQuota = await usageService.checkQuota(organizationId, 'LEAD_CREATED');
    if (!withinQuota) {
      return { allowed: false, reason: 'Monthly lead quota reached for your plan. Please upgrade to continue.' };
    }

    return { allowed: true };
  }

  async canUseAI(organizationId) {
    const withinQuota = await usageService.checkQuota(organizationId, 'AI_ANALYSIS');
    if (!withinQuota) {
      return { allowed: false, reason: 'Monthly AI analysis quota reached for your plan.' };
    }
    return { allowed: true };
  }

  async canAddTeamMember(organizationId) {
    const org = await Organization.findById(organizationId);
    const sub = await Subscription.findOne({ organizationId });
    const plan = getPlan(sub?.plan || org?.plan || 'starter');

    const currentSeats = org.teamMembers?.length || 1;
    if (currentSeats >= plan.limits.teamSeats) {
      return { allowed: false, reason: `Your ${plan.name} plan includes ${plan.limits.teamSeats} seat(s). Upgrade to add more team members.` };
    }
    return { allowed: true };
  }

  requireFeature(featureName) {
    return async (req, res, next) => {
      try {
        const organizationId = req.organizationId || req.user?.organizationId;
        if (!organizationId) {
          return res.status(401).json({ error: 'Organization context required' });
        }

        const allowed = await this.canUseFeature(organizationId, featureName);
        if (!allowed) {
          return res.status(403).json({
            error: `The ${featureName} feature is not available on your current plan. Please upgrade to unlock it.`,
            feature: featureName,
            upgradeRequired: true
          });
        }
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}

export const featureGateService = new FeatureGateService();
export default featureGateService;
