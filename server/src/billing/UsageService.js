import { UsageEvent } from '../models/UsageEvent.js';
import { Organization } from '../models/Organization.js';
import { Subscription } from '../models/Subscription.js';
import { getPlan } from './Plans.js';

export class UsageService {
  getCurrentBillingPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async trackUsage(organizationId, type, quantity = 1, metadata = {}) {
    if (!organizationId) return null;

    const billingPeriod = this.getCurrentBillingPeriod();
    const event = await UsageEvent.create({
      organizationId,
      type,
      quantity,
      metadata,
      tokensInput: metadata.tokensInput || 0,
      tokensOutput: metadata.tokensOutput || 0,
      costEstimate: metadata.costEstimate || 0,
      billingPeriod
    });

    return event;
  }

  async getUsage(organizationId) {
    const billingPeriod = this.getCurrentBillingPeriod();
    const org = await Organization.findById(organizationId);
    const sub = await Subscription.findOne({ organizationId });
    const plan = getPlan(sub?.plan || org?.plan || 'starter');

    const aggregated = await UsageEvent.aggregate([
      {
        $match: {
          organizationId: org._id,
          billingPeriod
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$quantity' },
          tokensInput: { $sum: '$tokensInput' },
          tokensOutput: { $sum: '$tokensOutput' },
          costEstimate: { $sum: '$costEstimate' }
        }
      }
    ]);

    const usageMap = {};
    for (const item of aggregated) {
      usageMap[item._id] = item.total;
    }

    const leadsCount = usageMap['LEAD_CREATED'] || 0;
    const aiAnalysesCount = usageMap['AI_ANALYSIS'] || 0;
    const aiMessagesCount = usageMap['AI_MESSAGE'] || 0;
    const followupsCount = usageMap['FOLLOWUP_SENT'] || 0;

    return {
      billingPeriod,
      plan: plan.id,
      planName: plan.name,
      limits: plan.limits,
      usage: {
        monthlyLeads: leadsCount,
        monthlyAIAnalyses: aiAnalysesCount,
        monthlyAIMessages: aiMessagesCount,
        monthlyFollowups: followupsCount,
        teamSeats: org.teamMembers?.length || 1
      },
      percentages: {
        leads: Math.min(100, Math.round((leadsCount / plan.limits.monthlyLeads) * 100)),
        aiAnalyses: Math.min(100, Math.round((aiAnalysesCount / plan.limits.monthlyAIAnalyses) * 100)),
        aiMessages: Math.min(100, Math.round((aiMessagesCount / plan.limits.monthlyAIMessages) * 100)),
        followups: Math.min(100, Math.round((followupsCount / plan.limits.monthlyFollowups) * 100))
      },
      isNearLimit: (leadsCount / plan.limits.monthlyLeads) >= 0.8,
      isAtLimit: (leadsCount / plan.limits.monthlyLeads) >= 1.0
    };
  }

  async checkQuota(organizationId, usageType) {
    const usage = await this.getUsage(organizationId);
    
    switch (usageType) {
      case 'LEAD_CREATED':
        return usage.usage.monthlyLeads < usage.limits.monthlyLeads;
      case 'AI_ANALYSIS':
        return usage.usage.monthlyAIAnalyses < usage.limits.monthlyAIAnalyses;
      case 'AI_MESSAGE':
        return usage.usage.monthlyAIMessages < usage.limits.monthlyAIMessages;
      case 'FOLLOWUP_SENT':
        return usage.usage.monthlyFollowups < usage.limits.monthlyFollowups;
      default:
        return true;
    }
  }
}

export const usageService = new UsageService();
export default usageService;
