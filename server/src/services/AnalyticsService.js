import { Lead } from '../models/Lead.js';
import { Contact } from '../models/Contact.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Deal } from '../models/Deal.js';
import { FollowUpTask } from '../models/FollowUpTask.js';
import { User } from '../models/User.js';

export class AnalyticsService {
  /**
   * Get dashboard overview KPIs
   */
  async getOverview(organizationId, dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const [
      totalLeads,
      newLeads,
      hotLeads,
      qualifiedLeads,
      wonDeals,
      lostDeals,
      pendingFollowUps,
      overdueFollowUps,
      pipelineValue,
      avgLeadScore,
      unrespondedLeads,
    ] = await Promise.all([
      Lead.countDocuments({ organizationId, isArchived: false }),
      Lead.countDocuments({
        organizationId,
        isArchived: false,
        createdAt: { $gte: start, $lte: end },
      }),
      Lead.countDocuments({
        organizationId,
        isArchived: false,
        leadTemperature: 'hot',
        status: { $nin: ['won', 'lost'] },
      }),
      Lead.countDocuments({
        organizationId,
        isArchived: false,
        isQualified: true,
      }),
      Lead.countDocuments({
        organizationId,
        status: 'won',
        updatedAt: { $gte: start, $lte: end },
      }),
      Lead.countDocuments({
        organizationId,
        status: 'lost',
        updatedAt: { $gte: start, $lte: end },
      }),
      FollowUpTask.countDocuments({
        organizationId,
        status: 'pending',
        scheduledAt: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999)),
        },
      }),
      FollowUpTask.countDocuments({
        organizationId,
        status: 'pending',
        scheduledAt: { $lt: new Date() },
      }),
      Lead.aggregate([
        {
          $match: {
            organizationId,
            isArchived: false,
            status: { $nin: ['won', 'lost'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } },
      ]),
      Lead.aggregate([
        { $match: { organizationId, isArchived: false } },
        { $group: { _id: null, avg: { $avg: '$leadScore' } } },
      ]),
      Lead.countDocuments({
        organizationId,
        isArchived: false,
        status: { $nin: ['won', 'lost'] },
        lastContactAt: null,
      }),
    ]);

    const wonRevenue = await Deal.aggregate([
      {
        $match: {
          organizationId,
          stage: 'won',
          wonAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);

    const lostRevenue = await Deal.aggregate([
      {
        $match: {
          organizationId,
          stage: 'lost',
          lostAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);

    const conversionRate = totalLeads > 0
      ? Math.round((wonDeals / Math.max(totalLeads, 1)) * 100 * 10) / 10
      : 0;

    return {
      totalLeads,
      newLeads,
      hotLeads,
      qualifiedLeads,
      wonDeals,
      lostDeals,
      pendingFollowUps,
      overdueFollowUps,
      pipelineValue: pipelineValue[0]?.total || 0,
      avgLeadScore: Math.round(avgLeadScore[0]?.avg || 0),
      conversionRate,
      wonRevenue: wonRevenue[0]?.total || 0,
      lostRevenue: lostRevenue[0]?.total || 0,
      unrespondedLeads,
      period: { start, end },
    };
  }

  /**
   * Get leads by source breakdown
   */
  async getLeadsBySource(organizationId, dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const data = await Lead.aggregate([
      {
        $match: {
          organizationId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          avgScore: { $avg: '$leadScore' },
          totalValue: { $sum: '$estimatedValue' },
          hotLeads: {
            $sum: { $cond: [{ $eq: ['$leadTemperature', 'hot'] }, 1, 0] },
          },
          wonLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return data.map((d) => ({
      source: d._id || 'unknown',
      count: d.count,
      avgScore: Math.round(d.avgScore || 0),
      totalValue: d.totalValue || 0,
      hotLeads: d.hotLeads,
      conversionRate: d.count > 0 ? Math.round((d.wonLeads / d.count) * 100) : 0,
    }));
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(organizationId) {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];

    const data = await Lead.aggregate([
      { $match: { organizationId, isArchived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' },
        },
      },
    ]);

    const stageMap = {};
    data.forEach((d) => { stageMap[d._id] = d; });

    return stages.map((stage, index) => ({
      stage,
      count: stageMap[stage]?.count || 0,
      totalValue: stageMap[stage]?.totalValue || 0,
      conversionRate: index > 0 && stageMap[stages[index - 1]]?.count > 0
        ? Math.round(((stageMap[stage]?.count || 0) / stageMap[stages[index - 1]].count) * 100)
        : 100,
    }));
  }

  /**
   * Get revenue by month
   */
  async getRevenueByMonth(organizationId, months = 6) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const data = await Deal.aggregate([
      {
        $match: {
          organizationId,
          stage: 'won',
          wonAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$wonAt' },
            month: { $month: '$wonAt' },
          },
          revenue: { $sum: '$value' },
          deals: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return data.map((d) => ({
      month: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
      revenue: d.revenue,
      deals: d.deals,
    }));
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformance(organizationId, dateRange = {}) {
    const { startDate, endDate } = dateRange;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const data = await Lead.aggregate([
      {
        $match: {
          organizationId,
          ownerId: { $ne: null },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$ownerId',
          totalLeads: { $sum: 1 },
          wonLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] },
          },
          hotLeads: {
            $sum: { $cond: [{ $eq: ['$leadTemperature', 'hot'] }, 1, 0] },
          },
          avgScore: { $avg: '$leadScore' },
          totalValue: { $sum: '$estimatedValue' },
        },
      },
    ]);

    // Populate user names
    const userIds = data.map((d) => d._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar').lean();
    const userMap = {};
    users.forEach((u) => { userMap[u._id.toString()] = u; });

    return data.map((d) => ({
      userId: d._id,
      user: userMap[d._id.toString()] || { name: 'Unknown' },
      totalLeads: d.totalLeads,
      wonLeads: d.wonLeads,
      hotLeads: d.hotLeads,
      avgScore: Math.round(d.avgScore || 0),
      totalValue: d.totalValue || 0,
      conversionRate: d.totalLeads > 0 ? Math.round((d.wonLeads / d.totalLeads) * 100) : 0,
    }));
  }

  /**
   * Get leads trend over time
   */
  async getLeadsTrend(organizationId, days = 30) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const data = await Lead.aggregate([
      {
        $match: {
          organizationId,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          hotCount: {
            $sum: { $cond: [{ $eq: ['$leadTemperature', 'hot'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return data.map((d) => ({
      date: d._id,
      count: d.count,
      hotCount: d.hotCount,
    }));
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
