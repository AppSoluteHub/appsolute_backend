import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.post('/start', chatController.startChat);
router.post('/message', chatController.sendMessage);
router.get('/:sessionId/messages', chatController.getMessages);

export default router;
