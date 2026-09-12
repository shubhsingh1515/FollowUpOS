import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { integrationService } from '../services/IntegrationService.js';
import { Organization } from '../models/Organization.js';
import { AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/integrations
 * Fetch all available integrations with connection status & masked credentials
 */
router.get('/', async (req, res) => {
  const integrations = await integrationService.getIntegrations(req.organizationId);
  const org = await Organization.findById(req.organizationId);

  res.json({
    success: true,
    data: {
      integrations,
      developerConfig: {
        apiKey: org?.settings?.apiKey ? `${org.settings.apiKey.slice(0, 12)}••••••••••••` : null,
        apiKeyCreatedAt: org?.settings?.apiKeyCreatedAt || null,
        webhookToken: org?.settings?.webhookToken || null,
        webhookUrl: org?.settings?.webhookToken
          ? `${req.protocol}://${req.get('host')}/api/public/webhooks/leads/${org.settings.webhookToken}`
          : `${req.protocol}://${req.get('host')}/api/public/webhooks/leads/demo_webhook_token`,
      },
    },
  });
});

/**
 * POST /api/integrations/:provider/test
 * Test credentials against live provider API without saving
 */
router.post('/:provider/test', authorize('owner', 'admin'), async (req, res) => {
  const { provider } = req.params;
  const credentials = req.body.credentials || {};

  const result = await integrationService.testConnection(provider, credentials);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error,
    });
  }

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/integrations/:provider/configure
 * Verify & encrypt credentials, then store for organization
 */
router.post('/:provider/configure', authorize('owner', 'admin'), async (req, res) => {
  const { provider } = req.params;
  const credentials = req.body.credentials || {};

  const result = await integrationService.saveIntegration(req.organizationId, provider, credentials);
  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/integrations/:provider/disconnect
 * Disconnect provider & wipe credentials
 */
router.post('/:provider/disconnect', authorize('owner', 'admin'), async (req, res) => {
  const { provider } = req.params;
  const result = await integrationService.disconnectIntegration(req.organizationId, provider);
  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/integrations/api-key/rotate
 * Rotate organization public developer API key
 */
router.post('/api-key/rotate', authorize('owner', 'admin'), async (req, res) => {
  const result = await integrationService.rotateApiKey(req.organizationId);
  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/integrations/api-key/revoke
 * Revoke organization public developer API key
 */
router.post('/api-key/revoke', authorize('owner', 'admin'), async (req, res) => {
  const result = await integrationService.revokeApiKey(req.organizationId);
  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/integrations/webhook/regenerate-token
 * Regenerate webhook token for inbound integrations
 */
router.post('/webhook/regenerate-token', authorize('owner', 'admin'), async (req, res) => {
  const result = await integrationService.regenerateWebhookToken(req.organizationId);
  res.json({
    success: true,
    data: result,
  });
});

export default router;
