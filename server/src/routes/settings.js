import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { Organization } from '../models/Organization.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Integration } from '../models/Integration.js';
import { AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

// Get organization settings
router.get('/organization', async (req, res) => {
  const org = await Organization.findById(req.organizationId);
  if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');
  res.json({ success: true, data: { organization: org } });
});

// Update organization
router.patch('/organization', authorize('owner', 'admin'), async (req, res) => {
  const org = await Organization.findByIdAndUpdate(
    req.organizationId,
    req.body,
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: { organization: org } });
});

// Complete onboarding step
router.post('/organization/onboarding', async (req, res) => {
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
  const members = await User.find({ organizationId: req.organizationId })
    .select('-passwordHash -refreshToken')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: { members } });
});

// Update user profile
router.patch('/profile', async (req, res) => {
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
  const { ids } = req.body;
  const query = { userId: req.user._id, organizationId: req.organizationId };
  if (ids?.length) query._id = { $in: ids };

  await Notification.updateMany(query, { read: true });
  res.json({ success: true });
});

// Get integrations
router.get('/integrations', async (req, res) => {
  const integrations = await Integration.find({ organizationId: req.organizationId })
    .select('-accessToken -refreshToken');
  
  // Return all possible integrations with their status
  const allProviders = ['email', 'whatsapp', 'instagram', 'facebook', 'linkedin', 'calendly', 'google_forms'];
  const integrated = {};
  integrations.forEach((i) => { integrated[i.provider] = i; });
  
  const result = allProviders.map((p) => ({
    provider: p,
    status: integrated[p]?.status || 'disconnected',
    lastSyncAt: integrated[p]?.lastSyncAt,
    errorMessage: integrated[p]?.errorMessage,
    metadata: integrated[p]?.metadata,
  }));

  res.json({ success: true, data: { integrations: result } });
});

// Connect integration (mock/demo)
router.post('/integrations/:provider/connect', async (req, res) => {
  const { provider } = req.params;
  
  // In demo mode, just mark as connected
  await Integration.findOneAndUpdate(
    { organizationId: req.organizationId, provider },
    {
      organizationId: req.organizationId,
      provider,
      status: 'connected',
      metadata: req.body.metadata || {},
      lastSyncAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: `${provider} connected successfully` });
});

// Disconnect integration
router.delete('/integrations/:provider', async (req, res) => {
  await Integration.findOneAndUpdate(
    { organizationId: req.organizationId, provider: req.params.provider },
    { status: 'disconnected', accessToken: null, refreshToken: null }
  );
  res.json({ success: true, message: 'Integration disconnected' });
});

export default router;
