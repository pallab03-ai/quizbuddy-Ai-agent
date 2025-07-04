import express from 'express';
import { aiAssist, chatbot } from '../controllers/aiController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/assist', authenticateToken, authorizeRoles('user', 'admin'), aiAssist);
router.post('/chat', authenticateToken, authorizeRoles('user'), chatbot);

export default router;
