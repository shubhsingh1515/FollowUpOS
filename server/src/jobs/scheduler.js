import cron from 'node-cron';
import mongoose from 'mongoose';
import { Organization } from '../models/Organization.js';
import { followUpService } from '../services/FollowUpService.js';
import { logger } from '../utils/logger.js';

let isRunning = false;

/**
 * Process due follow-up tasks across all organizations
 */
async function processFollowUps() {
  if (isRunning) {
    logger.debug('Follow-up processor already running, skipping...');
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    // Database offline / demo mode; skip background DB processing
    return;
  }

  isRunning = true;
  try {
    const organizations = await Organization.find({ 'settings.autoFollowUpEnabled': true })
      .select('_id')
      .lean();

    for (const org of organizations) {
      try {
        const count = await followUpService.processDueTasks(org._id);
        if (count > 0) {
          logger.info(`Processed ${count} follow-up tasks for org ${org._id}`);
        }
      } catch (err) {
        logger.error(`Follow-up processing failed for org ${org._id}:`, err.message);
      }
    }
  } catch (error) {
    logger.error('Scheduler error:', error.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Start all scheduled jobs
 */
export function startScheduler() {
  if (mongoose.connection.readyState !== 1) {
    logger.info('Scheduler deferred: MongoDB is offline / demo mode');
    return;
  }

  logger.info('Starting job scheduler...');

  // Process due follow-ups every minute
  cron.schedule('* * * * *', async () => {
    await processFollowUps();
  });

  // Daily sales summary at 8 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Generating daily sales summaries...');
    // Daily report generation would go here
  });

  // Cleanup old notifications (older than 30 days) every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const { Notification } = await import('../models/Notification.js');
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000);
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        read: true,
      });
      logger.info(`Cleanup: deleted ${result.deletedCount} old notifications`);
    } catch (err) {
      logger.error('Cleanup job failed:', err.message);
    }
  });

  logger.info('Job scheduler started');
}

export default startScheduler;
