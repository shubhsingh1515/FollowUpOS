import { analyticsService } from '../services/AnalyticsService.js';

/**
 * Analytics Controller
 * All endpoints use real MongoDB aggregations from AnalyticsService.
 * No mock data fallbacks — empty states are returned when there is no data.
 */
export const analyticsController = {
  async overview(req, res, next) {
    try {
      const dateRange = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };
      const data = await analyticsService.getOverview(req.organizationId, dateRange);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async leadsBySource(req, res, next) {
    try {
      const dateRange = { startDate: req.query.startDate, endDate: req.query.endDate };
      const data = await analyticsService.getLeadsBySource(req.organizationId, dateRange);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async conversionFunnel(req, res, next) {
    try {
      const data = await analyticsService.getConversionFunnel(req.organizationId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async revenue(req, res, next) {
    try {
      const months = parseInt(req.query.months) || 6;
      const data = await analyticsService.getRevenueByMonth(req.organizationId, months);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async teamPerformance(req, res, next) {
    try {
      const dateRange = { startDate: req.query.startDate, endDate: req.query.endDate };
      const data = await analyticsService.getTeamPerformance(req.organizationId, dateRange);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async leadsTrend(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await analyticsService.getLeadsTrend(req.organizationId, days);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};

export default analyticsController;
