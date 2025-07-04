// src/routes/question.js

import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import * as questionController from '../controllers/questionController.js';
const router = express.Router();

// Admin: add question to quiz
router.post('/:quizId', authenticateToken, authorizeRoles('admin'), questionController.addQuestion);
// Admin: update question
router.put('/:id', authenticateToken, authorizeRoles('admin'), questionController.updateQuestion);
// Admin: delete question
router.delete('/:id', authenticateToken, authorizeRoles('admin'), questionController.deleteQuestion);
// All: get questions for a quiz
router.get('/quiz/:quizId', authenticateToken, questionController.getQuestionsByQuiz);

export default router;
