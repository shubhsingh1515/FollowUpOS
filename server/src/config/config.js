import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/followupos',
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5174',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@followupos.com',
  },

  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'followupos-webhook-verify',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
  },

  meta: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    redirectUri: process.env.META_REDIRECT_URI || '',
    webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || 'followupos-meta-verify',
  },

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || '',
  },

  calendly: {
    clientId: process.env.CALENDLY_CLIENT_ID || '',
    clientSecret: process.env.CALENDLY_CLIENT_SECRET || '',
    redirectUri: process.env.CALENDLY_REDIRECT_URI || '',
    webhookSigningKey: process.env.CALENDLY_WEBHOOK_SIGNING_KEY || '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
      starter: process.env.STRIPE_PRICE_STARTER || '',
      growth: process.env.STRIPE_PRICE_GROWTH || '',
      agency: process.env.STRIPE_PRICE_AGENCY || '',
    },
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  demo: {
    enabled: process.env.DEMO_MODE === 'true',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || '0'.repeat(64),
  },
};

export function validateProductionConfig() {
  if (config.env !== 'production' || config.demo.enabled) {
    return { valid: true, warnings: [] };
  }

  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.includes('dev-')) missing.push('JWT_ACCESS_SECRET');
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.includes('dev-')) missing.push('JWT_REFRESH_SECRET');
  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) missing.push('ENCRYPTION_KEY');
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!process.env.RAZORPAY_KEY_ID && !process.env.STRIPE_SECRET_KEY) missing.push('RAZORPAY_KEY_ID or STRIPE_SECRET_KEY');

  if (missing.length > 0) {
    const errorMsg = `CRITICAL STARTUP CONFIGURATION ERROR: Missing mandatory production environment variables: ${missing.join(', ')}`;
    throw new Error(errorMsg);
  }

  return { valid: true, warnings: [] };
}

export default config;
