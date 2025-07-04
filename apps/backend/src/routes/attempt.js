
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import * as attemptController from '../controllers/attemptController.js';
const router = express.Router();

// User: submit attempt
router.post('/:quizId', authenticateToken, authorizeRoles('user'), attemptController.submitAttempt);

// User: get their attempts
router.get('/', authenticateToken, authorizeRoles('user'), attemptController.getUserAttempts);


// Admin: get all attempts for a specific quiz (must be before /:attemptId)
router.get('/admin/by-quiz', authenticateToken, authorizeRoles('admin'), attemptController.getAttemptsByQuiz);

// User or Admin: get full details of a specific attempt
router.get('/:attemptId', authenticateToken, authorizeRoles('user', 'admin'), attemptController.getAttemptDetails);

export default router;
