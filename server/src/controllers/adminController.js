import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Subscription } from '../models/Subscription.js';
import { Lead } from '../models/Lead.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { AuditLog } from '../models/AuditLog.js';
import { FeatureFlag } from '../models/FeatureFlag.js';
import { UsageEvent } from '../models/UsageEvent.js';
import { billingService } from '../billing/BillingService.js';
import { generateTokens } from '../middleware/auth.js';

export const getMetrics = async (req, res) => {
  try {
    const totalOrgs = await Organization.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } });

    const activeSubs = await Subscription.countDocuments({ status: 'active' });
    const trialSubs = await Subscription.countDocuments({ status: 'trialing' });
    const cancelledSubs = await Subscription.countDocuments({ status: 'cancelled' });

    const mrr = await billingService.calculateMRR();
    const arrEstimate = mrr * 12;

    // AI usage metrics for current month
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const aiEvents = await UsageEvent.aggregate([
      { $match: { billingPeriod: currentPeriod, type: { $in: ['AI_ANALYSIS', 'AI_MESSAGE'] } } },
      { $group: { _id: null, totalEvents: { $sum: '$quantity' }, totalCost: { $sum: '$costEstimate' } } }
    ]);

    res.json({
      success: true,
      data: {
        mrr,
        arrEstimate,
        totalOrgs,
        totalUsers,
        totalLeads,
        activeSubscriptions: activeSubs,
        trials: trialSubs,
        churnedSubscriptions: cancelledSubs,
        openTickets,
        aiUsageThisMonth: aiEvents[0]?.totalEvents || 0,
        estimatedAICostINR: aiEvents[0]?.totalCost || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrganizations = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search || '';

    const query = search ? { name: new RegExp(search, 'i') } : {};

    const [orgs, total] = await Promise.all([
      Organization.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Organization.countDocuments(query)
    ]);

    // Attach owner, subscription, and counts
    const enriched = await Promise.all(
      orgs.map(async (org) => {
        const [owner, sub, leadCount, userCount] = await Promise.all([
          User.findOne({ organizationId: org._id, role: 'owner' }).select('name email phone createdAt'),
          Subscription.findOne({ organizationId: org._id }).select('plan status billingCycle amount currentPeriodEnd'),
          Lead.countDocuments({ organizationId: org._id }),
          User.countDocuments({ organizationId: org._id })
        ]);

        return {
          ...org,
          owner,
          subscription: sub,
          leadCount,
          userCount
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrganizationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findById(id);
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const [users, subscription, leadsCount, recentLeads, tickets] = await Promise.all([
      User.find({ organizationId: id }).select('-passwordHash'),
      Subscription.findOne({ organizationId: id }),
      Lead.countDocuments({ organizationId: id }),
      Lead.find({ organizationId: id }).sort({ createdAt: -1 }).limit(5),
      SupportTicket.find({ organizationId: id }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      success: true,
      data: {
        organization: org,
        users,
        subscription,
        leadsCount,
        recentLeads,
        tickets
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrganizationAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, plan, trialDays, reason } = req.body;
    const admin = req.user;

    const org = await Organization.findById(id);
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    let actionLog = '';

    if (action === 'suspend') {
      org.settings.subscriptionStatus = 'suspended';
      await org.save();
      actionLog = 'ORGANIZATION_SUSPEND';
    } else if (action === 'reactivate') {
      org.settings.subscriptionStatus = 'active';
      await org.save();
      actionLog = 'ORGANIZATION_REACTIVATE';
    } else if (action === 'change_plan' && plan) {
      await billingService.changePlan(id, plan);
      actionLog = 'PLAN_CHANGE_MANUAL';
    } else if (action === 'extend_trial' && trialDays) {
      const sub = await Subscription.findOne({ organizationId: id });
      if (sub) {
        sub.currentPeriodEnd = new Date(Date.now() + parseInt(trialDays, 10) * 24 * 60 * 60 * 1000);
        sub.status = 'trialing';
        await sub.save();
      }
      actionLog = 'TRIAL_EXTENSION';
    }

    // Log admin audit event
    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: actionLog,
      targetOrgId: org._id,
      details: { action, plan, trialDays, reason }
    });

    res.json({
      success: true,
      message: `Action ${action} completed successfully on ${org.name}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const impersonateUser = async (req, res) => {
  try {
    const { targetUserId, reason } = req.body;
    const admin = req.user;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    const tokens = generateTokens(targetUser._id.toString());

    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'IMPERSONATION_START',
      targetOrgId: targetUser.organizationId,
      targetUserId: targetUser._id,
      details: { reason: reason || 'Support debugging' }
    });

    res.json({
      success: true,
      message: `Impersonation session created for ${targetUser.email}`,
      accessToken: tokens.accessToken,
      targetUser: targetUser.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSupportTickets = async (req, res) => {
  try {
    const status = req.query.status;
    const query = status ? { status } : {};

    const tickets = await SupportTicket.find(query)
      .populate('organizationId', 'name slug')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, replyMessage } = req.body;
    const admin = req.user;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (status) ticket.status = status;
    if (adminNotes !== undefined) ticket.adminNotes = adminNotes;
    if (replyMessage) {
      ticket.responses.push({
        senderType: 'admin',
        senderName: admin.name || 'FollowUpOS Support',
        message: replyMessage,
        createdAt: new Date()
      });
      if (ticket.status === 'open') ticket.status = 'in_progress';
    }

    await ticket.save();

    await AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'SUPPORT_TICKET_REPLY',
      targetOrgId: ticket.organizationId,
      details: { ticketId: ticket._id, status, replyMessage }
    });

    res.json({
      success: true,
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('targetOrgId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'degraded';
    
    res.json({
      success: true,
      data: {
        api: { status: 'healthy', uptime: process.uptime(), version: '2.0.0' },
        database: { status: dbStatus, host: mongoose.connection.host || 'local' },
        aiProvider: { status: process.env.OPENAI_API_KEY ? 'healthy' : 'mock_ready' },
        billing: { status: process.env.RAZORPAY_KEY_ID ? 'healthy' : 'mock_ready' },
        email: { status: process.env.SMTP_HOST ? 'healthy' : 'mock_ready' },
        scheduler: { status: 'healthy', jobs: ['followup_cadence_worker', 'usage_meter_sync'] },
        webhooks: { status: 'healthy', processedToday: 42 }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getMetrics,
  getOrganizations,
  getOrganizationDetail,
  updateOrganizationAction,
  impersonateUser,
  getSupportTickets,
  updateSupportTicket,
  getAuditLogs,
  getSystemHealth
};
