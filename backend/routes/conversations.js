import { Router } from 'express';
import { chat, startChat, getConversations } from '../controllers/conversationController.js';
import { chatLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/start', startChat);
router.post('/chat', chatLimiter, chat);
router.get('/', getConversations);

export default router;
