
// Main backend entry: sets up Express app and routes
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quiz.js';
import attemptRoutes from './routes/attempt.js';
import questionRoutes from './routes/question.js';
import aiRoutes from './routes/ai.js';

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Quiz App Backend is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
