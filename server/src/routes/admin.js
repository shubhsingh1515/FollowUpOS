import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Middleware to enforce Super Admin role
const requireSuperAdmin = (req, res, next) => {
  const user = req.user;
  if (!user || !['super_admin', 'support_admin'].includes(user.platformRole)) {
    // In demo mode or if user has owner role on HQ org, allow access
    if (process.env.DEMO_MODE === 'true' && user?.role === 'owner') {
      return next();
    }
    return res.status(403).json({
      error: 'Access denied. Super Admin platform credentials required.'
    });
  }
  next();
};

router.use(authenticate, requireSuperAdmin);

router.get('/metrics', adminController.getMetrics);
router.get('/organizations', adminController.getOrganizations);
router.get('/organizations/:id', adminController.getOrganizationDetail);
router.post('/organizations/:id/action', adminController.updateOrganizationAction);
router.post('/impersonate', adminController.impersonateUser);
router.get('/support-tickets', adminController.getSupportTickets);
router.patch('/support-tickets/:id', adminController.updateSupportTicket);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/system-health', adminController.getSystemHealth);

export default router;
