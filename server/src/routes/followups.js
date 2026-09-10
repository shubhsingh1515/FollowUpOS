import { Router } from 'express';
import { followUpController } from '../controllers/followUpController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', followUpController.list);
router.post('/', followUpController.create);
router.patch('/:id', followUpController.update);
router.post('/:id/complete', followUpController.complete);
router.post('/:id/cancel', followUpController.cancel);
router.post('/:id/reschedule', followUpController.reschedule);
router.post('/:id/generate-message', followUpController.generateMessage);

export default router;
