
// Database service: handles all DB queries for quizzes, questions, users, and attempts

// Get quiz by code
export const getQuizByCode = async (code) => {
  const trimmedCode = code.trim();
  const result = await pool.query('SELECT * FROM quizzes WHERE TRIM(code) ILIKE $1', [trimmedCode]);
  return result.rows[0];
};

// Create a quiz with questions, options, and a unique code
export const createQuizWithQuestions = async (title, topic, created_by, questions, code) => {
  const quizResult = await pool.query(
    'INSERT INTO quizzes (title, description, created_by, code) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, topic, created_by, code]
  );
  const quiz = quizResult.rows[0];
  for (const q of questions) {
    const questionResult = await pool.query(
      'INSERT INTO questions (quiz_id, question_text) VALUES ($1, $2) RETURNING *',
      [quiz.id, q.question]
    );
    const question = questionResult.rows[0];
    for (let i = 0; i < q.options.length; i++) {
      await pool.query(
        'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
        [question.id, q.options[i], i === q.answer]
      );
    }
  }
  return quiz;
};

// Attempt DB functions
export const getAttemptByUserAndQuiz = async (userId, quizId) => {
  const result = await pool.query('SELECT * FROM attempts WHERE user_id = $1 AND quiz_id = $2', [userId, quizId]);
  return result.rows[0];
};

export const isOptionCorrect = async (optionId) => {
  const result = await pool.query('SELECT is_correct FROM options WHERE id = $1', [optionId]);
  return result.rows[0] && result.rows[0].is_correct;
};

// Create a quiz attempt and store answers
export const createAttempt = async (userId, quizId, score, answers) => {
  const attemptResult = await pool.query(
    'INSERT INTO attempts (user_id, quiz_id, score) VALUES ($1, $2, $3) RETURNING *',
    [userId, quizId, score]
  );
  const attempt = attemptResult.rows[0];
  for (const ans of answers) {
    await pool.query(
      'INSERT INTO attempt_answers (attempt_id, question_id, selected_option_id) VALUES ($1, $2, $3)',
      [attempt.id, ans.questionId, ans.selectedOptionId]
    );
  }
  return attempt;
};

// Get all attempts by a user
export const getAttemptsByUser = async (userId) => {
  // Join quizzes to get quiz title for each attempt
  const result = await pool.query(`
    SELECT a.*, q.title AS title, q.description AS quiz_topic
    FROM attempts a
    JOIN quizzes q ON a.quiz_id = q.id
    WHERE a.user_id = $1
    ORDER BY a.submitted_at DESC
  `, [userId]);
  return result.rows;
};

// Question and Option DB functions
export const addQuestion = async (quizId, question_text, options) => {
  const questionResult = await pool.query(
    'INSERT INTO questions (quiz_id, question_text) VALUES ($1, $2) RETURNING *',
    [quizId, question_text]
  );
  const question = questionResult.rows[0];
  const optionResults = [];
  for (const opt of options) {
    const optResult = await pool.query(
      'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3) RETURNING *',
      [question.id, opt.option_text, !!opt.is_correct]
    );
    optionResults.push(optResult.rows[0]);
  }
  question.options = optionResults;
  return question;
};

export const updateQuestion = async (id, question_text, options) => {
  const questionResult = await pool.query(
    'UPDATE questions SET question_text = $1 WHERE id = $2 RETURNING *',
    [question_text, id]
  );
  const question = questionResult.rows[0];
  if (!question) return null;
  // Remove old options
  await pool.query('DELETE FROM options WHERE question_id = $1', [id]);
  // Add new options
  const optionResults = [];
  for (const opt of options) {
    const optResult = await pool.query(
      'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3) RETURNING *',
      [id, opt.option_text, !!opt.is_correct]
    );
    optionResults.push(optResult.rows[0]);
  }
  question.options = optionResults;
  return question;
};

export const deleteQuestion = async (id) => {
  await pool.query('DELETE FROM questions WHERE id = $1', [id]);
  return true;
};

// Get all questions (with options) for a quiz
export const getQuestionsByQuiz = async (quizId) => {
  const qResult = await pool.query('SELECT * FROM questions WHERE quiz_id = $1', [quizId]);
  const questions = qResult.rows;
  for (const q of questions) {
    const oResult = await pool.query('SELECT id, option_text, is_correct FROM options WHERE question_id = $1', [q.id]);
    q.options = oResult.rows;
  }
  return questions;
};

import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const createUser = async (username, password_hash, role) => {
  const result = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
    [username, password_hash, role]
  );
  return result.rows[0];
};

export const findUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};


// Quiz DB functions
export const createQuiz = async (title, description, tags, created_by, code) => {
  const result = await pool.query(
    'INSERT INTO quizzes (title, description, tags, created_by, code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, description, tags, created_by, code]
  );
  return result.rows[0];
};

export const getAllQuizzes = async (created_by) => {
  if (created_by) {
    const result = await pool.query('SELECT * FROM quizzes WHERE created_by = $1', [created_by]);
    return result.rows;
  } else {
    const result = await pool.query('SELECT * FROM quizzes');
    return result.rows;
  }
};

export const getQuizById = async (id) => {
  const result = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateQuiz = async (id, title, description, tags) => {
  const result = await pool.query(
    'UPDATE quizzes SET title = $1, description = $2, tags = $3 WHERE id = $4 RETURNING *',
    [title, description, tags, id]
  );
  return result.rows[0];
};

export const deleteQuiz = async (id) => {
  await pool.query('DELETE FROM quizzes WHERE id = $1', [id]);
  return true;
};
