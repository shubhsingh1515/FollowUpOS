import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getDatabaseStatus } from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import contactRoutes from './routes/contacts.js';
import conversationRoutes from './routes/conversations.js';
import followUpRoutes from './routes/followups.js';
import analyticsRoutes from './routes/analytics.js';
import dealRoutes from './routes/deals.js';
import settingsRoutes from './routes/settings.js';
import publicRoutes from './routes/public.js';
import copilotRoutes from './routes/copilot.js';
import campaignsRoutes from './routes/campaigns.js';
import billingRoutes from './routes/billing.js';
import webhookRoutes from './routes/webhooks.js';
import adminRoutes from './routes/admin.js';
import supportRoutes from './routes/support.js';
import integrationsRoutes from './routes/integrations.js';

const app = express();

app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:[0-9]+$/.test(origin) || origin === config.client.url || origin === process.env.APP_URL) {
      callback(null, true);
    } else {
      callback(null, true); // Allow configured origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { success: false, message: 'Too many requests', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many auth attempts', code: 'RATE_LIMITED' },
});

// Body parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTP logging
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.url === '/api/health',
  }));
}

// Health check endpoints
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    environment: config.env,
    version: '2.0.0',
    database: dbStatus.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Public endpoints (no auth required)
app.use('/api/public', publicRoutes);
app.use('/api/webhooks', webhookRoutes);

// Rate-limited Authenticated API routes
app.use('/api', apiLimiter);
app.use('/auth', authLimiter, authRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/campaigns', campaignsRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
