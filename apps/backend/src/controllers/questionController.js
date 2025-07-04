// src/controllers/questionController.js
import * as db from '../services/db.js';

export const addQuestion = async (req, res) => {
  const { quizId } = req.params;
  const { question_text, options } = req.body;
  if (!question_text || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: 'Question text and at least 2 options are required.' });
  }
  try {
    const question = await db.addQuestion(quizId, question_text, options);
    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { question_text, options } = req.body;
  try {
    const question = await db.updateQuestion(id, question_text, options);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteQuestion(id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getQuestionsByQuiz = async (req, res) => {
  const { quizId } = req.params;
  try {
    const questions = await db.getQuestionsByQuiz(quizId);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
