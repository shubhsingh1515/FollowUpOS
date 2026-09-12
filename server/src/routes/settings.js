import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth.js';
import { Organization } from '../models/Organization.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Integration } from '../models/Integration.js';
import { integrationService } from '../services/IntegrationService.js';
import { AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

// Mock data for offline/demo mode
const mockOrg = {
  _id: '660000000000000000000002',
  name: 'GrowthScale Agency',
  slug: 'growthscale-agency',
  plan: 'growth',
  subscription: {
    plan: 'growth',
    status: 'active',
  },
  settings: {
    autoFollowUpEnabled: true,
    defaultTone: 'consultative',
    workingHours: { start: '09:00', end: '19:00', timezone: 'Asia/Kolkata' },
  },
};

const mockTeam = [
  { _id: 'u1', name: 'Arjun Kapoor', email: 'arjun@growthscale.in', role: 'owner', createdAt: new Date() },
  { _id: 'u2', name: 'Sneha Patel', email: 'sneha@growthscale.in', role: 'sales_rep', createdAt: new Date() },
  { _id: 'u3', name: 'Kavita Rao', email: 'kavita@growthscale.in', role: 'sales_rep', createdAt: new Date() },
];

// Get organization settings
router.get('/organization', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, data: { organization: mockOrg } });
  }
  const org = await Organization.findById(req.organizationId);
  if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');
  res.json({ success: true, data: { organization: org } });
});

// Update organization
router.patch('/organization', authorize('owner', 'admin'), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    Object.assign(mockOrg, req.body);
    return res.json({ success: true, data: { organization: mockOrg } });
  }
  const org = await Organization.findByIdAndUpdate(
    req.organizationId,
    req.body,
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: { organization: org } });
});

// Complete onboarding step
router.post('/organization/onboarding', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, data: { organization: mockOrg } });
  }
  const { step, data } = req.body;
  const org = await Organization.findById(req.organizationId);
  
  Object.assign(org, data);
  org.onboardingStep = Math.max(org.onboardingStep || 0, step);
  if (step >= 7) {
    org.onboardingCompleted = true;
    await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true });
  }
  await org.save();

  res.json({ success: true, data: { organization: org } });
});

// Get team members
router.get('/team', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, data: { members: mockTeam } });
  }
  const members = await User.find({ organizationId: req.organizationId })
    .select('-passwordHash -refreshToken')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: { members } });
});

// Update user profile
router.patch('/profile', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, data: { user: { _id: req.user?._id || 'u1', name: req.body.name || 'Demo User' } } });
  }
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true }
  );
  res.json({ success: true, data: { user } });
});

// Get notifications
router.get('/notifications', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, data: { notifications: [], unreadCount: 0 } });
  }
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { userId: req.user._id, organizationId: req.organizationId };
  if (unreadOnly === 'true') query.read = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit)),
    Notification.countDocuments({ userId: req.user._id, organizationId: req.organizationId, read: false }),
  ]);

  res.json({ success: true, data: { notifications, unreadCount } });
});

// Mark notifications as read
router.post('/notifications/mark-read', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true });
  }
  const { ids } = req.body;
  const query = { userId: req.user._id, organizationId: req.organizationId };
  if (ids?.length) query._id = { $in: ids };

  await Notification.updateMany(query, { read: true });
  res.json({ success: true });
});

// Get integrations
router.get('/integrations', async (req, res) => {
  const integrations = await integrationService.getIntegrations(req.organizationId);
  res.json({ success: true, data: { integrations } });
});

// Connect/Configure integration
router.post('/integrations/:provider/connect', async (req, res) => {
  const { provider } = req.params;
  const credentials = req.body.credentials || req.body.metadata || {};
  const result = await integrationService.saveIntegration(req.organizationId, provider, credentials);
  res.json({ success: true, message: `${provider} connected successfully`, data: result });
});

// Disconnect integration
router.delete('/integrations/:provider', async (req, res) => {
  const { provider } = req.params;
  const result = await integrationService.disconnectIntegration(req.organizationId, provider);
  res.json({ success: true, message: 'Integration disconnected', data: result });
});

export default router;
