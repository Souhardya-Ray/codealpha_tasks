const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTS);
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ ok: true });
});

// GET /api/auth/me - returns the current logged-in user, if any
router.get('/me', async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.json({ user: null });
    const jwtLib = require('jsonwebtoken');
    const payload = jwtLib.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('name email');
    if (!user) return res.json({ user: null });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.json({ user: null });
  }
});

// POST /api/auth/google - STUB
// Google OAuth is optional per the spec. Wire this up with a library like
// google-auth-library or passport-google-oauth20 when you're ready; verify the
// Google ID token server-side, then findOrCreate a User by googleId and sign a
// JWT the same way /login does above.
router.post('/google', (req, res) => {
  res.status(501).json({ error: 'Google OAuth is not configured yet. See routes/auth.js for wiring notes.' });
});

module.exports = router;
