import { Router } from 'express';
import { conversationController } from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', conversationController.list);
router.get('/:id', conversationController.get);
router.post('/:id/messages', conversationController.sendMessage);
router.post('/:id/generate-reply', conversationController.generateReply);

export default router;
