import { FollowUpTask } from '../models/FollowUpTask.js';
import { FollowUpSequence } from '../models/FollowUpSequence.js';
import { Lead } from '../models/Lead.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { getAIProvider } from '../ai/index.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class FollowUpService {
  /**
   * Schedule follow-up tasks for a lead based on a sequence
   */
  async scheduleSequence(leadId, organizationId, sequenceId, startFrom = 1) {
    const lead = await Lead.findOne({ _id: leadId, organizationId }).populate('contactId');
    if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');

    // Check lead is eligible for follow-ups
    if (['won', 'lost'].includes(lead.status)) {
      throw new AppError('Cannot schedule follow-ups for won/lost leads', 400, 'INELIGIBLE');
    }

    // Get sequence
    let sequence;
    if (sequenceId) {
      sequence = await FollowUpSequence.findOne({ _id: sequenceId, organizationId });
    } else {
      sequence = await FollowUpSequence.findOne({ organizationId, isDefault: true, active: true });
    }

    if (!sequence) {
      // Create minimal default if none exists
      logger.warn('No follow-up sequence found for org', { organizationId });
      return [];
    }

    // Cancel existing pending tasks for this lead
    await FollowUpTask.updateMany(
      { leadId, organizationId, status: 'pending' },
      { status: 'cancelled', cancelledAt: new Date(), cancelledReason: 'New sequence started' }
    );

    const now = new Date();
    const tasks = [];

    for (const step of sequence.steps.filter((s) => s.stepNumber >= startFrom)) {
      // Calculate scheduled time
      let delayMs = 0;
      if (step.delay > 0) {
        const unit = step.delayUnit || 'hours';
        if (unit === 'minutes') delayMs = step.delay * 60 * 1000;
        else if (unit === 'hours') delayMs = step.delay * 3600 * 1000;
        else if (unit === 'days') delayMs = step.delay * 86400 * 1000;
      }

      // Add cumulative delays from previous steps
      const cumulativeMs = tasks.reduce((sum, t) => {
        const diff = new Date(t.scheduledAt) - now;
        return Math.max(sum, diff + 1000);
      }, 0);

      const scheduledAt = new Date(now.getTime() + cumulativeMs + delayMs);

      const idempotencyKey = `${leadId}-${sequence._id}-step${step.stepNumber}-${scheduledAt.getTime()}`;

      try {
        const task = await FollowUpTask.create({
          organizationId,
          leadId,
          sequenceId: sequence._id,
          stepNumber: step.stepNumber,
          type: 'auto_followup',
          scheduledAt,
          status: 'pending',
          message: step.messageTemplate || null,
          aiGenerated: step.useAI,
          idempotencyKey,
        });

        tasks.push(task);
      } catch (err) {
        if (err.code === 11000) {
          logger.debug('Duplicate follow-up task skipped', { idempotencyKey });
        } else {
          throw err;
        }
      }
    }

    // Update lead's next follow-up time
    if (tasks.length > 0) {
      await Lead.findByIdAndUpdate(leadId, {
        nextFollowUpAt: tasks[0].scheduledAt,
      });
    }

    logger.info('Follow-up sequence scheduled', {
      leadId,
      sequenceId: sequence._id,
      taskCount: tasks.length,
    });

    return tasks;
  }

  /**
   * Get follow-up tasks with filters
   */
  async getTasks(organizationId, filters = {}) {
    const { status, assignedTo, startDate, endDate, leadId } = filters;

    const query = { organizationId };
    if (status) query.status = Array.isArray(status) ? { $in: status } : status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (leadId) query.leadId = leadId;
    if (startDate || endDate) {
      query.scheduledAt = {};
      if (startDate) query.scheduledAt.$gte = new Date(startDate);
      if (endDate) query.scheduledAt.$lte = new Date(endDate);
    }

    const tasks = await FollowUpTask.find(query)
      .populate({
        path: 'leadId',
        populate: { path: 'contactId', select: 'fullName company email' },
      })
      .populate('assignedTo', 'name avatar')
      .sort({ scheduledAt: 1 })
      .lean();

    return tasks;
  }

  /**
   * Process due follow-up tasks (called by scheduler)
   */
  async processDueTasks(organizationId) {
    const now = new Date();

    const dueTasks = await FollowUpTask.find({
      organizationId,
      status: 'pending',
      scheduledAt: { $lte: now },
    }).populate({
      path: 'leadId',
      populate: [
        { path: 'contactId' },
      ],
    });

    logger.info(`Processing ${dueTasks.length} due follow-up tasks`);

    for (const task of dueTasks) {
      await this._processTask(task);
    }

    return dueTasks.length;
  }

  async _processTask(task) {
    try {
      // Mark as processing (idempotency guard)
      const updated = await FollowUpTask.findOneAndUpdate(
        { _id: task._id, status: 'pending' },
        { status: 'processing' },
        { new: true }
      );

      if (!updated) {
        logger.debug('Task already being processed', { taskId: task._id });
        return;
      }

      const lead = task.leadId;
      if (!lead) {
        await FollowUpTask.findByIdAndUpdate(task._id, {
          status: 'failed',
          failedReason: 'Lead not found',
        });
        return;
      }

      // Safety checks — do not send if conditions not met
      const currentLead = await Lead.findById(lead._id || lead);
      if (!currentLead) return;

      if (['won', 'lost'].includes(currentLead.status)) {
        await FollowUpTask.findByIdAndUpdate(task._id, {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledReason: `Lead is ${currentLead.status}`,
        });
        return;
      }

      if (currentLead.isArchived) {
        await FollowUpTask.findByIdAndUpdate(task._id, {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledReason: 'Lead is archived',
        });
        return;
      }

      // Check if customer replied recently (within the task delay window)
      if (currentLead.lastInboundAt) {
        const taskCreated = new Date(task.createdAt);
        if (new Date(currentLead.lastInboundAt) > taskCreated) {
          await FollowUpTask.findByIdAndUpdate(task._id, {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelledReason: 'Customer already replied',
          });
          return;
        }
      }

      // Mark completed (in approval mode, just notify; in auto mode, send)
      await FollowUpTask.findByIdAndUpdate(task._id, {
        status: 'completed',
        completedAt: new Date(),
      });

      // Update lead
      await Lead.findByIdAndUpdate(currentLead._id, {
        $inc: { followUpCount: 1 },
        lastContactAt: new Date(),
        lastOutboundAt: new Date(),
      });

      // Create notification for the assigned user or owner
      const notifyUserId = currentLead.ownerId || task.assignedTo;
      if (notifyUserId) {
        await Notification.create({
          organizationId: task.organizationId,
          userId: notifyUserId,
          type: 'followup_overdue',
          title: 'Follow-up ready to send',
          message: `Follow-up for ${lead.contactId?.fullName || 'a lead'} is ready. Review and send.`,
          link: `/leads/${currentLead._id}`,
          metadata: { leadId: currentLead._id, taskId: task._id },
        });
      }

      logger.info('Follow-up task completed', { taskId: task._id, leadId: currentLead._id });
    } catch (error) {
      logger.error('Failed to process follow-up task:', error.message);
      await FollowUpTask.findByIdAndUpdate(task._id, {
        status: 'failed',
        failedReason: error.message,
      }).catch(() => {});
    }
  }

  /**
   * Complete a follow-up task manually
   */
  async completeTask(taskId, organizationId, userId, message) {
    const task = await FollowUpTask.findOne({ _id: taskId, organizationId });
    if (!task) throw new AppError('Follow-up task not found', 404, 'TASK_NOT_FOUND');

    task.status = 'completed';
    task.completedAt = new Date();
    if (message) task.message = message;
    await task.save();

    return task;
  }

  /**
   * Cancel a follow-up task
   */
  async cancelTask(taskId, organizationId, reason) {
    const task = await FollowUpTask.findOneAndUpdate(
      { _id: taskId, organizationId, status: { $in: ['pending', 'processing'] } },
      { status: 'cancelled', cancelledAt: new Date(), cancelledReason: reason || 'Cancelled by user' },
      { new: true }
    );

    if (!task) throw new AppError('Task not found or already completed', 404, 'TASK_NOT_FOUND');
    return task;
  }

  /**
   * Reschedule a follow-up task
   */
  async rescheduleTask(taskId, organizationId, newDate) {
    const task = await FollowUpTask.findOneAndUpdate(
      { _id: taskId, organizationId, status: 'pending' },
      { scheduledAt: new Date(newDate) },
      { new: true }
    );

    if (!task) throw new AppError('Task not found or not reschedulable', 404, 'TASK_NOT_FOUND');

    // Update lead's next follow-up
    await Lead.findByIdAndUpdate(task.leadId, { nextFollowUpAt: new Date(newDate) });

    return task;
  }

  /**
   * Generate AI message for a pending follow-up
   */
  async generateFollowUpMessage(taskId, organizationId, organization) {
    const task = await FollowUpTask.findOne({ _id: taskId, organizationId }).populate('leadId');
    if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');

    const lead = await Lead.findById(task.leadId).populate('contactId');
    const conversation = await Conversation.findOne({ leadId: task.leadId, organizationId });
    
    let messages = [];
    if (conversation) {
      messages = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .limit(15)
        .lean();
    }

    const ai = getAIProvider();

    const sequence = await FollowUpSequence.findById(task.sequenceId);
    const totalSteps = sequence?.steps?.length || 4;

    const message = await ai.generateFollowUp({
      org: organization,
      lead: {
        ...lead.toObject(),
        daysSinceContact: lead.lastContactAt
          ? Math.floor((Date.now() - new Date(lead.lastContactAt)) / 86400000)
          : null,
      },
      contact: lead.contactId,
      messages,
      stepNumber: task.stepNumber,
      totalSteps,
    });

    // Update task with generated message
    task.message = message;
    task.aiGenerated = true;
    await task.save();

    return { message, taskId };
  }
}

export const followUpService = new FollowUpService();
export default followUpService;
