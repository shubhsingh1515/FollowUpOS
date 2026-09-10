import { analyticsService } from '../services/AnalyticsService.js';
import mongoose from 'mongoose';
import { mockAnalytics } from '../services/mockData.js';

export const analyticsController = {
  async overview(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: mockAnalytics.overview });
    }
    const dateRange = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const data = await analyticsService.getOverview(req.organizationId, dateRange);
    res.json({ success: true, data });
  },

  async leadsBySource(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: mockAnalytics.leadsBySource });
    }
    const dateRange = { startDate: req.query.startDate, endDate: req.query.endDate };
    const data = await analyticsService.getLeadsBySource(req.organizationId, dateRange);
    res.json({ success: true, data });
  },

  async conversionFunnel(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: mockAnalytics.conversionFunnel });
    }
    const data = await analyticsService.getConversionFunnel(req.organizationId);
    res.json({ success: true, data });
  },

  async revenue(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: mockAnalytics.revenueByMonth });
    }
    const months = parseInt(req.query.months) || 6;
    const data = await analyticsService.getRevenueByMonth(req.organizationId, months);
    res.json({ success: true, data });
  },

  async teamPerformance(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: mockAnalytics.teamPerformance });
    }
    const dateRange = { startDate: req.query.startDate, endDate: req.query.endDate };
    const data = await analyticsService.getTeamPerformance(req.organizationId, dateRange);
    res.json({ success: true, data });
  },

  async leadsTrend(req, res) {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: mockAnalytics.leadsTrend });
    }
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getLeadsTrend(req.organizationId, days);
    res.json({ success: true, data });
  },
};

export default analyticsController;
