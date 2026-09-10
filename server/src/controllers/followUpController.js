import { followUpService } from '../services/FollowUpService.js';
import { Organization } from '../models/Organization.js';

export const followUpController = {
  async list(req, res) {
    import('mongoose');
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      const { mockFollowUps } = await import('../services/mockData.js');
      return res.json({ success: true, data: { tasks: mockFollowUps } });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const filters = {
      status: req.query.status,
      leadId: req.query.leadId,
    };

    if (req.query.filter === 'today') {
      filters.startDate = startOfDay;
      filters.endDate = endOfDay;
    } else if (req.query.filter === 'upcoming') {
      filters.startDate = new Date();
      filters.status = 'pending';
    } else if (req.query.filter === 'overdue') {
      filters.endDate = new Date();
      filters.status = 'pending';
    }

    const tasks = await followUpService.getTasks(req.organizationId, filters);
    res.json({ success: true, data: { tasks } });
  },

  async create(req, res) {
    const { leadId, sequenceId } = req.body;
    const tasks = await followUpService.scheduleSequence(
      leadId,
      req.organizationId,
      sequenceId
    );
    res.status(201).json({ success: true, data: { tasks } });
  },

  async update(req, res) {
    const { FollowUpTask } = await import('../models/FollowUpTask.js');
    const task = await FollowUpTask.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: { task } });
  },

  async complete(req, res) {
    const task = await followUpService.completeTask(
      req.params.id,
      req.organizationId,
      req.user._id,
      req.body.message
    );
    res.json({ success: true, data: { task } });
  },

  async cancel(req, res) {
    const task = await followUpService.cancelTask(
      req.params.id,
      req.organizationId,
      req.body.reason
    );
    res.json({ success: true, data: { task } });
  },

  async reschedule(req, res) {
    const task = await followUpService.rescheduleTask(
      req.params.id,
      req.organizationId,
      req.body.scheduledAt
    );
    res.json({ success: true, data: { task } });
  },

  async generateMessage(req, res) {
    const organization = await Organization.findById(req.organizationId);
    const result = await followUpService.generateFollowUpMessage(
      req.params.id,
      req.organizationId,
      organization
    );
    res.json({ success: true, data: result });
  },
};

export default followUpController;
