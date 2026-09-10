import { Router } from 'express';
import { contactController } from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', contactController.list);
router.post('/', contactController.create);
router.get('/:id', contactController.get);
router.patch('/:id', contactController.update);
router.delete('/:id', contactController.delete);

export default router;
