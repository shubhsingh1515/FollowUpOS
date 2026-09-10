import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { mockCopilotResponses } from '../services/mockData.js';

const router = Router();
router.use(authenticate);

router.post('/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  const normalized = query.toLowerCase().trim().replace(/[?!.,]/g, '');
  
  // Check mock responses first
  let match = Object.keys(mockCopilotResponses).find(k => 
    normalized.includes(k) || k.includes(normalized)
  );

  let response;
  if (match) {
    response = mockCopilotResponses[match];
  } else if (normalized.includes('today') || normalized.includes('contact')) {
    response = mockCopilotResponses['which leads should i contact today'];
  } else if (normalized.includes('unfollowed') || normalized.includes('haven\'t')) {
    response = mockCopilotResponses['show me leads that haven\'t been followed up with'];
  } else if (normalized.includes('hot') || normalized.includes('replied')) {
    response = mockCopilotResponses['which hot leads haven\'t replied'];
  } else if (normalized.includes('summary') || normalized.includes('activity')) {
    response = mockCopilotResponses['summarize today\'s sales activity'];
  } else if (normalized.includes('close') || normalized.includes('opportunity') || normalized.includes('revenue')) {
    response = mockCopilotResponses['show me opportunities likely to close this month'];
  } else {
    response = {
      type: 'general',
      text: `Based on your live sales data, I analyzed "${query}". FollowUpOS recommends prioritizing your 3 hot inbound leads with response windows under 2 hours to maximize close rate.`,
      recommendedAction: 'View Today Priorities',
    };
  }

  res.json({
    success: true,
    data: {
      query,
      answer: response,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
