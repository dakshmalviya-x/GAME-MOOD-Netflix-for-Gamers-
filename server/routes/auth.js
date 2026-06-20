import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Helper to load users
async function loadUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Helper to save users
async function saveUsers(users) {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

// Custom Hashing Functions
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const users = await loadUsers();
    
    // Check if user exists
    const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (userExists) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    const { salt, hash } = hashPassword(password);
    const userId = crypto.randomBytes(8).toString('hex');

    const newUser = {
      id: userId,
      username,
      salt,
      hash,
      isPremium: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    // Generate JWT
    const token = jwt.sign(
      { id: userId, username, isPremium: false },
      process.env.JWT_SECRET || 'gamemood_super_secret_signing_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        username,
        isPremium: false
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const users = await loadUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user || !verifyPassword(password, user.salt, user.hash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, isPremium: user.isPremium },
      process.env.JWT_SECRET || 'gamemood_super_secret_signing_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        isPremium: user.isPremium
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/upgrade (Mock payment validation and profile upgrade)
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentDetails } = req.body;

    // In a real application, we would validate credit card or UPI processing here.
    // We mock-succeed after simple validation.
    if (!paymentDetails || !paymentDetails.method) {
      return res.status(400).json({ error: 'Payment details are required to upgrade.' });
    }

    const users = await loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Mark as premium
    users[userIndex].isPremium = true;
    await saveUsers(users);

    // Generate updated token
    const token = jwt.sign(
      { id: users[userIndex].id, username: users[userIndex].username, isPremium: true },
      process.env.JWT_SECRET || 'gamemood_super_secret_signing_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Congratulations! You are now a Premium member.',
      token,
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        isPremium: true
      }
    });
  } catch (err) {
    console.error('Upgrade error:', err);
    res.status(500).json({ error: 'Internal server error during account upgrade.' });
  }
});

// GET /api/auth/me (Get current profile status)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = await loadUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      user: {
        id: user.id,
        username: user.username,
        isPremium: user.isPremium
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user details.' });
  }
});

export default router;
