import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { mockCampaigns } from '../services/mockData.js';

const router = Router();
router.use(authenticate);

let campaigns = [...mockCampaigns];

router.get('/', (req, res) => {
  res.json({ success: true, data: { campaigns } });
});

router.post('/', (req, res) => {
  const newCamp = {
    id: `camp-${Date.now()}`,
    name: req.body.name || 'Custom Revival Campaign',
    targetAudience: req.body.targetAudience || 'Custom Segment',
    leadCount: req.body.leadCount || 25,
    status: 'active',
    responseRate: 0,
    aiStrategy: req.body.aiStrategy || 'AI personalized check-in',
    templateMessage: req.body.templateMessage || 'Hi {{name}}, wanted to check in regarding your interest.',
  };
  campaigns.unshift(newCamp);
  res.status(201).json({ success: true, data: { campaign: newCamp } });
});

export default router;
