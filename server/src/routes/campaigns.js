import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { Campaign } from '../models/Campaign.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ organizationId: req.organizationId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { campaigns } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newCamp = new Campaign({
      organizationId: req.organizationId,
      name: req.body.name || 'Custom Revival Campaign',
      targetAudience: req.body.targetAudience || 'Custom Segment',
      leadCount: req.body.leadCount || 0,
      status: 'active',
      responseRate: 0,
      aiStrategy: req.body.aiStrategy || 'AI personalized check-in',
      templateMessage: req.body.templateMessage || 'Hi {{name}}, wanted to check in regarding your interest.',
      createdBy: req.user._id,
    });
    await newCamp.save();
    res.status(201).json({ success: true, data: { campaign: newCamp } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
