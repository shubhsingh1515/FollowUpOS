import 'dotenv/config';
import app from './app.js';
import { config, validateProductionConfig } from './config/config.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { startScheduler } from './jobs/scheduler.js';

async function startServer() {
  try {
    // Validate configuration
    validateProductionConfig();
    // Connect to MongoDB with graceful fallback
    try {
      await connectDatabase();
      logger.info('Database connected successfully');
    } catch (dbErr) {
      logger.warn('MongoDB not connected on localhost:27017. Server operating in offline/demo mode with zero-latency in-memory data.');
    }

    // Start the HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`FollowUpOS API server running on port ${config.port} [${config.env}]`);
      logger.info(`Demo mode: ${config.demo.enabled}`);
      logger.info(`Client URL: ${config.client.url}`);
    });

    // Start background job scheduler
    try {
      startScheduler();
    } catch (err) {
      logger.warn('Scheduler start deferred:', err.message);
    }

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    logger.error('Make sure MongoDB is running and MONGODB_URI is set in .env');
    process.exit(1);
  }
}

startServer();
