import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as voiceController from '../controllers/voiceController.js';

const router = express.Router();

// Public webhook endpoint for Telnyx voice events
router.post('/webhooks/telnyx/voice', voiceController.webhookHandler);

// All voice API endpoints require authentication
router.use('/voice', authenticate);

// Connection & Credentials routes
router.get('/voice/status', voiceController.status);
router.post('/voice/telnyx/connect', voiceController.connectTelnyx);
router.post('/voice/telnyx/test', voiceController.testTelnyx);
router.delete('/voice/telnyx/disconnect', voiceController.disconnectTelnyx);

// AI Voice Agent routes
router.get('/voice/agents', voiceController.getAgents);
router.post('/voice/agents', voiceController.createAgent);
router.get('/voice/agents/:id', voiceController.getAgent);
router.put('/voice/agents/:id', voiceController.updateAgent);
router.delete('/voice/agents/:id', voiceController.deleteAgent);

// Phone Number management routes
router.get('/voice/numbers', voiceController.getNumbers);
router.get('/voice/numbers/search', voiceController.searchAvailableNumbers);
router.post('/voice/numbers/purchase', voiceController.purchaseNumber);
router.post('/voice/numbers/:id/assign', voiceController.assignNumber);
router.put('/voice/numbers/:id', voiceController.updateNumber);

// Single Call management routes
router.get('/voice/calls', voiceController.getCalls);
router.post('/voice/calls', voiceController.initiateCall);
router.get('/voice/calls/:id', voiceController.getCall);
router.post('/voice/calls/:id/end', voiceController.endCall);
router.post('/voice/calls/:id/transfer', voiceController.transferCall);

// Voice Campaign routes
router.get('/voice/campaigns', voiceController.getCampaigns);
router.post('/voice/campaigns', voiceController.createCampaign);
router.get('/voice/campaigns/:id', voiceController.getCampaign);
router.put('/voice/campaigns/:id', voiceController.updateCampaign);
router.post('/voice/campaigns/:id/start', voiceController.startCampaign);
router.post('/voice/campaigns/:id/pause', voiceController.pauseCampaign);
router.post('/voice/campaigns/:id/resume', voiceController.resumeCampaign);
router.post('/voice/campaigns/:id/cancel', voiceController.cancelCampaign);

// Usage & Analytics
router.get('/voice/usage', voiceController.getUsage);
router.get('/voice/analytics', voiceController.getAnalytics);

export default router;
