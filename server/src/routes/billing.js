import { Router } from 'express';
import * as billingController from '../controllers/billingController.js';
import { requireAuth, requireOrg } from '../middleware/auth.js';

const router = Router();

router.get('/plans', billingController.getPlans);

// Protected customer billing routes
router.use(requireAuth, requireOrg);

router.get('/current', billingController.getCurrentBilling);
router.post('/checkout', billingController.createCheckout);
router.post('/change-plan', billingController.changePlan);
router.post('/cancel', billingController.cancelSubscription);
router.get('/usage', billingController.getUsage);
router.get('/invoices', billingController.getInvoices);

export default router;
