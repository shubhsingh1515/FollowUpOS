import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { Deal } from '../models/Deal.js';
import { Lead } from '../models/Lead.js';
import { Activity } from '../models/Activity.js';
import { AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const deals = await Deal.find({ organizationId: req.organizationId })
    .populate({ path: 'leadId', populate: { path: 'contactId', select: 'fullName company' } })
    .populate('ownerId', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: { deals } });
});

router.post('/', async (req, res) => {
  const name = req.body.name || req.body.title || 'Sales Opportunity';
  const deal = await Deal.create({
    ...req.body,
    name,
    organizationId: req.organizationId,
    ownerId: req.user._id,
  });
  
  if (deal.leadId) {
    await Activity.create({
      organizationId: req.organizationId,
      leadId: deal.leadId,
      userId: req.user._id,
      type: 'deal_created',
      title: `Deal created: ${deal.name}`,
      metadata: { dealId: deal._id, value: deal.value },
    });
  }

  res.status(201).json({ success: true, data: { deal } });
});

router.patch('/:id', async (req, res) => {
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.organizationId },
    req.body,
    { new: true }
  );
  if (!deal) throw new AppError('Deal not found', 404, 'DEAL_NOT_FOUND');

  // Handle won/lost
  if (req.body.stage === 'won' && !deal.wonAt) {
    deal.wonAt = new Date();
    await deal.save();
    if (deal.leadId) {
      await Lead.findByIdAndUpdate(deal.leadId, { status: 'won', stage: 'won' });
      await Activity.create({
        organizationId: req.organizationId,
        leadId: deal.leadId,
        userId: req.user._id,
        type: 'deal_won',
        title: `Deal won: ${deal.name} — ₹${deal.value?.toLocaleString()}`,
        metadata: { dealId: deal._id, value: deal.value },
      });
    }
  }

  if (req.body.stage === 'lost') {
    deal.lostAt = new Date();
    await deal.save();
    if (deal.leadId) {
      await Lead.findByIdAndUpdate(deal.leadId, { status: 'lost', stage: 'lost' });
      await Activity.create({
        organizationId: req.organizationId,
        leadId: deal.leadId,
        userId: req.user._id,
        type: 'deal_lost',
        title: `Deal lost: ${deal.name}`,
        metadata: { dealId: deal._id, reason: req.body.lostReason },
      });
    }
  }

  res.json({ success: true, data: { deal } });
});

router.delete('/:id', async (req, res) => {
  await Deal.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
  res.json({ success: true, message: 'Deal deleted' });
});

export default router;
