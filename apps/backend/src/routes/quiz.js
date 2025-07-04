
// Quiz routes: handles quiz CRUD and lookup endpoints
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import * as quizController from '../controllers/quizController.js';
const router = express.Router();

// Admin: create quiz
router.post('/', authenticateToken, authorizeRoles('admin'), quizController.createQuiz);
// Admin: update quiz
router.put('/:id', authenticateToken, authorizeRoles('admin'), quizController.updateQuiz);
// Admin: delete quiz
router.delete('/:id', authenticateToken, authorizeRoles('admin'), quizController.deleteQuiz);
// All: get all quizzes
router.get('/', authenticateToken, quizController.getAllQuizzes);
// All: get quiz by code (must be before :id route)
router.get('/code/:code', authenticateToken, quizController.getQuizByCode);
// All: get quiz by id
router.get('/:id', authenticateToken, quizController.getQuizById);

// Admin: create full quiz (AI-generated)
router.post('/full', authenticateToken, authorizeRoles('admin'), quizController.createFullQuiz);

export default router;
