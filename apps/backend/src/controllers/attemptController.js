// Admin: Get all attempts for a specific quiz (with user id and score)
export const getAttemptsByQuiz = async (req, res) => {
  const quizId = req.query.quizId;
  if (!quizId) return res.status(400).json({ message: 'quizId is required' });
  try {
    const result = await db.pool.query(
      `SELECT a.id as attempt_id, a.user_id, a.score, u.username, a.submitted_at
         FROM attempts a JOIN users u ON a.user_id = u.id
         WHERE a.quiz_id = $1
         ORDER BY a.submitted_at DESC`,
      [quizId]
    );
    res.json({ attempts: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get full attempt details (questions, user answers, correct answers)
export const getAttemptDetails = async (req, res) => {
  const attemptId = req.params.attemptId;
  const userId = req.user.id;
  const userRole = req.user.role;
  try {
    // Admins can view any attempt, users can only view their own
    let attemptResult;
    if (userRole === 'admin') {
      attemptResult = await db.pool.query(
        `SELECT a.*, q.title AS quiz_title, q.description AS quiz_topic
         FROM attempts a JOIN quizzes q ON a.quiz_id = q.id
         WHERE a.id = $1`,
        [attemptId]
      );
    } else {
      attemptResult = await db.pool.query(
        `SELECT a.*, q.title AS quiz_title, q.description AS quiz_topic
         FROM attempts a JOIN quizzes q ON a.quiz_id = q.id
         WHERE a.id = $1 AND a.user_id = $2`,
        [attemptId, userId]
      );
    }
    if (!attemptResult.rows.length) return res.status(404).json({ message: 'Attempt not found' });
    const attempt = attemptResult.rows[0];

    // Get all questions for the quiz
    const questions = await db.getQuestionsByQuiz(attempt.quiz_id);

    // Get user's answers for this attempt
    const answersResult = await db.pool.query(
      `SELECT aa.question_id, aa.selected_option_id
         FROM attempt_answers aa WHERE aa.attempt_id = $1`,
      [attemptId]
    );
    const userAnswersMap = {};
    for (const row of answersResult.rows) {
      userAnswersMap[row.question_id] = row.selected_option_id;
    }

    // Format questions with user answer and correct answer
    const formattedQuestions = questions.map(q => {
      const correctOption = q.options.find(opt => opt.is_correct);
      const userOptionId = userAnswersMap[q.id];
      return {
        id: q.id,
        question: q.question_text,
        options: q.options.map(opt => ({ id: opt.id, option_text: opt.option_text })),
        correct_answer: correctOption ? correctOption.id : null,
        user_answer: userOptionId
      };
    });

    res.json({
      attempt: {
        id: attempt.id,
        quiz_title: attempt.quiz_title,
        quiz_topic: attempt.quiz_topic,
        score: attempt.score,
        questions: formattedQuestions
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// src/controllers/attemptController.js
import * as db from '../services/db.js';
import pkg from 'pg';
const { Pool } = pkg;
// Use the same pool as db.js
export const pool = db.pool;

export const submitAttempt = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.id;
  const { answers } = req.body; // [{ questionId, selectedOptionId }]
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'Answers are required.' });
  }
  try {
    // Prevent re-attempt
    const alreadyAttempted = await db.getAttemptByUserAndQuiz(userId, quizId);
    if (alreadyAttempted) {
      return res.status(400).json({ message: 'You have already attempted this quiz.' });
    }
    // Score calculation
    let score = 0;
    for (const ans of answers) {
      const isCorrect = await db.isOptionCorrect(ans.selectedOptionId);
      if (isCorrect) score++;
    }
    // Store attempt
    const attempt = await db.createAttempt(userId, quizId, score, answers);
    res.status(201).json({ attempt, score });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getUserAttempts = async (req, res) => {
  const userId = req.user.id;
  try {
    const attempts = await db.getAttemptsByUser(userId);
    // Debug: log the first attempt object to see available fields
    if (attempts && attempts.length > 0) {
      console.log('Sample attempt object:', attempts[0]);
    }
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
