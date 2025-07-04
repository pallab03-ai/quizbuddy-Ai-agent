
// Auth controller: handles user registration and login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../services/db.js';


// Register a new user
export const register = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, hashedPassword, role);
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Login a user and return JWT token
export const login = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const user = await db.findUserByUsername(username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.role !== role) return res.status(401).json({ message: 'Role does not match' });
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
