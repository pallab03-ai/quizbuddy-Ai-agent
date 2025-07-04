// Quiz controller: handles quiz CRUD and lookup endpoints

import * as db from '../services/db.js';
import { nanoid } from 'nanoid';

// Get quiz by code (with questions and options)
export const getQuizByCode = async (req, res) => {
  const { code } = req.params;
  try {
    // Look up quiz by unique code
    const quiz = await db.getQuizByCode(code);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    // Get questions and options for the quiz
    const questions = await db.getQuestionsByQuiz(quiz.id);
    // Format questions for frontend
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question_text,
      options: q.options.map(opt => ({
        id: opt.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct
      }))
    }));
    res.json({ quiz: { ...quiz, questions: formattedQuestions } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a quiz with questions, options, and a unique code
export const createFullQuiz = async (req, res) => {
  const { title, topic, questions } = req.body;
  const created_by = req.user.id;
  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Title and questions are required' });
  }
  const uniqueCode = nanoid(8);
  try {
    const quiz = await db.createQuizWithQuestions(title, topic, created_by, questions, uniqueCode);
    res.status(201).json({ quiz, code: uniqueCode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a quiz (basic info)
export const createQuiz = async (req, res) => {
  const { title, description, tags } = req.body;
  const created_by = req.user.id;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const uniqueCode = nanoid(8);
  try {
    const quiz = await db.createQuiz(title, description, tags, created_by, uniqueCode);
    res.status(201).json({ quiz, code: uniqueCode });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Update quiz info
export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { title, description, tags } = req.body;
  try {
    const quiz = await db.updateQuiz(id, title, description, tags);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Delete a quiz
export const deleteQuiz = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteQuiz(id);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get all quizzes (admin sees only their own)
export const getAllQuizzes = async (req, res) => {
  try {
    let quizzes;
    if (req.user && req.user.role === 'admin') {
      quizzes = await db.getAllQuizzes(req.user.id);
    } else {
      quizzes = await db.getAllQuizzes();
    }
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get quiz by ID
export const getQuizById = async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await db.getQuizById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
