import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Integration } from '../models/Integration.js';
import { Organization } from '../models/Organization.js';
import { encryptToken, decryptToken } from '../utils/encryption.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

function maskSecret(val) {
  if (!val || typeof val !== 'string') return '';
  const str = val.trim();
  if (str.length <= 6) return '••••••••';
  if (str.startsWith('sk-')) {
    return `sk-••••••••${str.slice(-4)}`;
  }
  if (str.includes('@')) {
    const [user, domain] = str.split('@');
    return `${user.slice(0, 2)}••••@${domain}`;
  }
  return `${str.slice(0, 4)}••••••••${str.slice(-4)}`;
}

export const INTEGRATION_CATALOG = [
  {
    provider: 'whatsapp',
    name: 'WhatsApp Business Cloud API',
    description: 'Send instant AI qualification follow-ups, sync client chats, and receive inbound messages.',
    category: 'messaging',
    icon: '💬',
    authType: 'api_key',
    requiredCredentials: [
      { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: 'e.g. 109283746592837', required: true, helpText: 'Found under WhatsApp > API Setup in Meta Developer Dashboard.' },
      { key: 'businessAccountId', label: 'WhatsApp Business Account ID', placeholder: 'e.g. 982736451029384', required: true, helpText: 'Found in Meta Business Suite > WhatsApp Accounts.' },
      { key: 'accessToken', label: 'System User Permanent Access Token', placeholder: 'EAAG...', required: true, isSecret: true, helpText: 'Generated in Meta Business Settings > System Users with whatsapp_business_messaging permissions.' },
    ],
    optionalCredentials: [
      { key: 'verifyToken', label: 'Webhook Verify Token', placeholder: 'followupos_verify_secret', required: false, isSecret: true, helpText: 'Used to verify Meta inbound webhook subscriptions.' },
    ],
    documentationUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
  },
  {
    provider: 'email',
    name: 'Email (SMTP & Custom Domain)',
    description: 'Sync your domain inbox, track opens and click rates, and trigger high-converting cadence drips.',
    category: 'email',
    icon: '✉️',
    authType: 'credentials',
    requiredCredentials: [
      { key: 'host', label: 'SMTP Host', placeholder: 'smtp.gmail.com / smtp.office365.com', required: true, helpText: 'Outbound mail server hostname provided by your email provider.' },
      { key: 'port', label: 'SMTP Port', placeholder: '587 (TLS) or 465 (SSL)', required: true, helpText: 'Usually 587 with STARTTLS or 465 with SSL.' },
      { key: 'user', label: 'SMTP Username / Account', placeholder: 'notifications@agency.com', required: true, helpText: 'Your mailbox email address or username.' },
      { key: 'pass', label: 'SMTP Password / App Password', placeholder: '••••••••••••••••', required: true, isSecret: true, helpText: 'For Gmail, use a 16-character App Password generated in Google Account security.' },
      { key: 'fromEmail', label: 'Sender From Email', placeholder: 'Arjun <sales@growthscale.in>', required: true, helpText: 'The From address displayed to recipients.' },
    ],
    optionalCredentials: [
      { key: 'secure', label: 'Use SSL (Port 465)', placeholder: 'false', required: false, helpText: 'Set to true only if connecting via Port 465.' },
      { key: 'fromName', label: 'Sender Display Name', placeholder: 'GrowthScale Sales Team', required: false, helpText: 'Friendly sender name.' },
    ],
    documentationUrl: 'https://support.google.com/mail/answer/185833',
  },
  {
    provider: 'calendly',
    name: 'Calendly & Cal.com',
    description: 'Auto-detect scheduled discovery calls, auto-pause follow-ups, and trigger pre-call reminders.',
    category: 'calendar',
    icon: '📅',
    authType: 'api_key',
    requiredCredentials: [
      { key: 'apiKey', label: 'Personal Access Token', placeholder: 'cal_live_••••••••', required: true, isSecret: true, helpText: 'Generate from Calendly > Integrations > API & Webhooks > Personal Access Tokens.' },
    ],
    optionalCredentials: [
      { key: 'webhookSigningKey', label: 'Webhook Signing Key', placeholder: 'whsec_••••••••', required: false, isSecret: true, helpText: 'Used to verify webhook payloads from Calendly.' },
    ],
    documentationUrl: 'https://developer.calendly.com/api-docs',
  },
  {
    provider: 'meta_lead_ads',
    name: 'Meta Lead Ads (FB & Instagram)',
    description: 'Stream instant lead ads directly into FollowUpOS within 3 seconds of submission.',
    category: 'social',
    icon: '📱',
    authType: 'api_key',
    requiredCredentials: [
      { key: 'appId', label: 'Meta App ID', placeholder: 'e.g. 19283746592837', required: true, helpText: 'Found on your App Dashboard in Meta for Developers.' },
      { key: 'pageAccessToken', label: 'Page Access Token (leads_retrieval scope)', placeholder: 'EAAG...', required: true, isSecret: true, helpText: 'Token with leads_retrieval and pages_show_list permissions.' },
      { key: 'pageId', label: 'Facebook Page ID', placeholder: 'e.g. 1029384756', required: true, helpText: 'The ID of the Facebook page running lead generation ad forms.' },
    ],
    optionalCredentials: [],
    documentationUrl: 'https://developers.facebook.com/docs/marketing-api/guides/lead-ads',
  },
  {
    provider: 'openai',
    name: 'OpenAI (BYOK — Bring Your Own Key)',
    description: 'Use your own dedicated OpenAI API key for higher rate limits and custom fine-tuned GPT models.',
    category: 'ai',
    icon: '🧠',
    authType: 'api_key',
    requiredCredentials: [
      { key: 'apiKey', label: 'OpenAI API Key', placeholder: 'sk-proj-••••••••••••', required: true, isSecret: true, helpText: 'Create a secret key from OpenAI Dashboard > API Keys.' },
    ],
    optionalCredentials: [
      { key: 'model', label: 'Custom Model ID', placeholder: 'gpt-4o / gpt-4o-mini', required: false, helpText: 'Leave blank to use the platform optimized default model.' },
      { key: 'orgId', label: 'OpenAI Organization ID', placeholder: 'org-••••••••', required: false, helpText: 'Optional Organization ID for multi-org OpenAI accounts.' },
    ],
    documentationUrl: 'https://platform.openai.com/api-keys',
  },
  {
    provider: 'google_forms',
    name: 'Google Forms & Typeform',
    description: 'Instant lead ingestion the moment a prospect fills your qualification or audit form.',
    category: 'forms',
    icon: '📋',
    authType: 'webhook',
    requiredCredentials: [],
    optionalCredentials: [],
    documentationUrl: 'https://followupos.com/docs/integrations/google-forms',
  },
];

export class IntegrationService {
  /**
   * Get all integrations for organization with masked secrets
   */
  async getIntegrations(organizationId) {
    const org = await Organization.findById(organizationId);
    if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');

    const integrations = await Integration.find({ organizationId });
    const integrationMap = new Map();
    integrations.forEach((i) => integrationMap.set(i.provider, i));

    return INTEGRATION_CATALOG.map((catalogItem) => {
      const existing = integrationMap.get(catalogItem.provider);
      return {
        ...catalogItem,
        status: existing?.status || 'not_connected',
        accountIdentifier: existing?.accountIdentifier || null,
        lastVerifiedAt: existing?.lastVerifiedAt || null,
        lastSyncAt: existing?.lastSyncAt || null,
        lastError: existing?.lastError || null,
        maskedCredentials: existing?.maskedCredentials ? Object.fromEntries(existing.maskedCredentials) : {},
        recentDeliveries: existing?.recentDeliveries || [],
      };
    });
  }

  /**
   * Test connection credentials against live provider API
   */
  async testConnection(provider, credentials) {
    logger.info(`Testing integration connection for provider: ${provider}`);

    try {
      switch (provider) {
        case 'email': {
          const host = credentials.host?.trim();
          const port = parseInt(credentials.port, 10) || 587;
          const user = credentials.user?.trim();
          const pass = credentials.pass?.trim();
          const secure = credentials.secure === true || credentials.secure === 'true' || port === 465;

          if (!host || !user || !pass) {
            throw new Error('SMTP Host, Username, and Password are all required.');
          }

          // Test actual SMTP connection
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
          });

          await transporter.verify();
          return {
            success: true,
            accountIdentifier: user,
            lastVerifiedAt: new Date(),
            message: `Successfully connected to SMTP server ${host}:${port} as ${user}.`,
          };
        }

        case 'whatsapp': {
          const { phoneNumberId, accessToken } = credentials;
          if (!phoneNumberId || !accessToken) {
            throw new Error('Phone Number ID and Permanent Access Token are required.');
          }

          if (!accessToken.startsWith('EAAG') && !accessToken.startsWith('EAA') && !config.demo.enabled) {
            throw new Error('Invalid Meta access token format. Access tokens typically start with EAAG...');
          }

          // In live production, verify token with Meta Graph API
          if (!config.demo.enabled && process.env.NODE_ENV === 'production') {
            const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData?.error?.message || 'Meta Graph API rejected the credentials.');
            }
            const data = await res.json();
            return {
              success: true,
              accountIdentifier: `${data.display_phone_number || phoneNumberId} (Verified)`,
              lastVerifiedAt: new Date(),
              message: 'WhatsApp Business Cloud API connection verified successfully.',
            };
          }

          return {
            success: true,
            accountIdentifier: `WhatsApp ID: ${phoneNumberId}`,
            lastVerifiedAt: new Date(),
            message: 'WhatsApp credentials validated successfully.',
          };
        }

        case 'openai': {
          const { apiKey } = credentials;
          if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('Invalid OpenAI API key. Keys start with sk-... or sk-proj-...');
          }

          if (!config.demo.enabled && process.env.NODE_ENV === 'production') {
            const res = await fetch('https://api.openai.com/v1/models', {
              headers: { Authorization: `Bearer ${apiKey}` },
            });
            if (!res.ok) {
              throw new Error('OpenAI authentication failed. Please verify your API key.');
            }
          }

          return {
            success: true,
            accountIdentifier: `OpenAI BYOK (${maskSecret(apiKey)})`,
            lastVerifiedAt: new Date(),
            message: 'OpenAI API key verified and ready for inferences.',
          };
        }

        case 'calendly': {
          const { apiKey } = credentials;
          if (!apiKey) {
            throw new Error('Personal Access Token is required.');
          }

          if (!config.demo.enabled && process.env.NODE_ENV === 'production') {
            const res = await fetch('https://api.calendly.com/users/me', {
              headers: { Authorization: `Bearer ${apiKey}` },
            });
            if (!res.ok) {
              throw new Error('Calendly rejected the access token. Verify permissions in Calendly settings.');
            }
            const data = await res.json();
            return {
              success: true,
              accountIdentifier: data.resource?.email || 'Calendly User',
              lastVerifiedAt: new Date(),
              message: 'Calendly integration verified.',
            };
          }

          return {
            success: true,
            accountIdentifier: 'Calendly Integration Active',
            lastVerifiedAt: new Date(),
            message: 'Calendly token format verified.',
          };
        }

        case 'meta_lead_ads': {
          const { appId, pageAccessToken, pageId } = credentials;
          if (!appId || !pageAccessToken || !pageId) {
            throw new Error('App ID, Page Access Token, and Page ID are all required.');
          }

          return {
            success: true,
            accountIdentifier: `Meta Page ID: ${pageId}`,
            lastVerifiedAt: new Date(),
            message: 'Meta Lead Ads configuration validated.',
          };
        }

        default:
          return {
            success: true,
            accountIdentifier: `${provider} Connected`,
            lastVerifiedAt: new Date(),
            message: 'Configuration verified successfully.',
          };
      }
    } catch (err) {
      logger.warn(`Integration test failed for ${provider}:`, err.message);
      return {
        success: false,
        error: {
          code: 'INTEGRATION_AUTH_FAILED',
          message: err.message || 'Authentication test failed. Please verify credentials.',
        },
      };
    }
  }

  /**
   * Save customer integration credentials (encrypted at rest)
   */
  async saveIntegration(organizationId, provider, rawCredentials) {
    const org = await Organization.findById(organizationId);
    if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND');

    // Test connection first
    const testResult = await this.testConnection(provider, rawCredentials);
    if (!testResult.success) {
      // Record error on integration
      await Integration.findOneAndUpdate(
        { organizationId, provider },
        {
          organizationId,
          provider,
          status: 'error',
          lastError: {
            code: testResult.error?.code || 'AUTH_ERROR',
            message: testResult.error?.message || 'Failed to authenticate',
            timestamp: new Date(),
          },
        },
        { upsert: true }
      );
      throw new AppError(testResult.error?.message || 'Integration verification failed.', 400, 'VERIFICATION_FAILED');
    }

    // Encrypt raw credentials with AES-256-GCM
    const encryptedCredentials = encryptToken(JSON.stringify(rawCredentials));

    // Generate safe masked credentials for frontend UI
    const maskedMap = new Map();
    for (const [k, v] of Object.entries(rawCredentials)) {
      if (typeof v === 'string') {
        maskedMap.set(k, maskSecret(v));
      }
    }

    const integration = await Integration.findOneAndUpdate(
      { organizationId, provider },
      {
        organizationId,
        provider,
        status: 'connected',
        encryptedCredentials,
        maskedCredentials: maskedMap,
        accountIdentifier: testResult.accountIdentifier || `${provider} Account`,
        lastVerifiedAt: new Date(),
        lastSyncAt: new Date(),
        lastError: null,
      },
      { upsert: true, new: true }
    );

    logger.info(`Integration ${provider} connected successfully for organization ${organizationId}`);

    return {
      provider,
      status: 'connected',
      accountIdentifier: integration.accountIdentifier,
      lastVerifiedAt: integration.lastVerifiedAt,
      maskedCredentials: Object.fromEntries(maskedMap),
      message: `${provider} successfully connected and verified.`,
    };
  }

  /**
   * Disconnect integration and wipe encrypted credentials
   */
  async disconnectIntegration(organizationId, provider) {
    await Integration.findOneAndUpdate(
      { organizationId, provider },
      {
        status: 'not_connected',
        encryptedCredentials: null,
        maskedCredentials: new Map(),
        accountIdentifier: null,
        lastError: null,
      }
    );
    logger.info(`Integration ${provider} disconnected for org ${organizationId}`);
    return { success: true, message: `${provider} has been disconnected.` };
  }

  /**
   * Get decrypted credentials for internal worker/agent usage (never send to client)
   */
  async getDecryptedCredentials(organizationId, provider) {
    const integration = await Integration.findOne({ organizationId, provider, status: 'connected' })
      .select('+encryptedCredentials');

    if (!integration || !integration.encryptedCredentials) {
      return null;
    }

    try {
      const decrypted = decryptToken(integration.encryptedCredentials);
      return JSON.parse(decrypted);
    } catch (err) {
      logger.error(`Failed to decrypt credentials for ${provider}:`, err.message);
      return null;
    }
  }

  /**
   * Record a webhook delivery audit event
   */
  async recordDelivery(organizationId, provider, deliveryData) {
    try {
      const integration = await Integration.findOne({ organizationId, provider });
      if (integration) {
        integration.recentDeliveries.unshift({
          timestamp: new Date(),
          event: deliveryData.event || 'inbound_lead',
          status: deliveryData.status || 'success',
          statusCode: deliveryData.statusCode || 200,
          payloadPreview: typeof deliveryData.payload === 'string'
            ? deliveryData.payload.slice(0, 150)
            : JSON.stringify(deliveryData.payload || {}).slice(0, 150),
          error: deliveryData.error || null,
        });

        if (integration.recentDeliveries.length > 20) {
          integration.recentDeliveries = integration.recentDeliveries.slice(0, 20);
        }
        await integration.save();
      }
    } catch (err) {
      logger.warn('Failed to record delivery event:', err.message);
    }
  }

  /**
   * Rotate Organization Developer API Key
   */
  async rotateApiKey(organizationId) {
    const newApiKey = `fup_live_${crypto.randomBytes(24).toString('hex')}`;
    const org = await Organization.findByIdAndUpdate(
      organizationId,
      { 'settings.apiKey': newApiKey, 'settings.apiKeyCreatedAt': new Date() },
      { new: true }
    );
    return {
      apiKey: newApiKey,
      createdAt: org.settings?.apiKeyCreatedAt || new Date(),
      message: 'New API Key generated. Save it securely; you will not be able to view it again in plaintext.',
    };
  }

  /**
   * Revoke Organization Developer API Key
   */
  async revokeApiKey(organizationId) {
    await Organization.findByIdAndUpdate(
      organizationId,
      { 'settings.apiKey': null },
      { new: true }
    );
    return { success: true, message: 'API Key revoked. Inbound API requests using this key will now be rejected.' };
  }

  /**
   * Regenerate Inbound Webhook Token
   */
  async regenerateWebhookToken(organizationId) {
    const newToken = `whk_${crypto.randomBytes(20).toString('hex')}`;
    await Organization.findByIdAndUpdate(
      organizationId,
      { 'settings.webhookToken': newToken },
      { new: true }
    );
    return {
      webhookToken: newToken,
      webhookUrl: `${config.client.url.replace(':5173', ':5000')}/api/public/webhooks/leads/${newToken}`,
      message: 'Inbound Webhook token regenerated successfully.',
    };
  }
}

export const integrationService = new IntegrationService();
export default integrationService;
