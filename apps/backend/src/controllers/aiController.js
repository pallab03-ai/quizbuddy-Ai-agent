// src/controllers/aiController.js
import axios from 'axios';
const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:8001';

export const aiAssist = async (req, res) => {
  try {
    const aiRes = await axios.post(`${AI_AGENT_URL}/generate-quiz`, req.body);
    res.json(aiRes.data);
  } catch (err) {
    res.status(500).json({ message: 'AI Assist error', error: err.message });
  }
};

export const chatbot = async (req, res) => {
  try {
    const aiRes = await axios.post(`${AI_AGENT_URL}/chat`, req.body);
    res.json(aiRes.data);
  } catch (err) {
    res.status(500).json({ message: 'Chatbot error', error: err.message });
  }
};
