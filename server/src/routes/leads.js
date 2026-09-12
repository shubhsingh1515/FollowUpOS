import { Router } from 'express';
import { leadController } from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', leadController.list);
router.post('/', leadController.create);
router.post('/check-duplicate', leadController.checkDuplicate);
router.get('/priorities', leadController.getTodaysPriorities);
router.get('/:id', leadController.get);
router.patch('/:id', leadController.update);
router.delete('/:id', leadController.archive);

router.get('/:id/score-explanation', leadController.getScoreExplanation);
router.get('/:id/objections', leadController.getObjections);
router.get('/:id/conversation', leadController.getConversation);
router.post('/:id/messages', leadController.sendMessage);
router.post('/:id/ai-generate', leadController.aiGenerate);
router.post('/:id/analyze', leadController.analyze);
router.post('/:id/generate-reply', leadController.generateReply);
router.post('/:id/schedule-followup', leadController.scheduleFollowUp);
router.post('/:id/assign', leadController.assign);
router.post('/:id/change-stage', leadController.changeStage);

export default router;
