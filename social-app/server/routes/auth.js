const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidUsername(u) { return /^[a-z0-9_]{3,20}$/.test(u); }
function signToken(userId) { return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' }); }

function publicUser(u) {
  return {
    id: u._id, name: u.name, username: u.username, email: u.email,
    bio: u.bio, avatarUrl: u.avatarUrl, bannerUrl: u.bannerUrl, createdAt: u.createdAt
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Name, username, email and password are required' });
    }
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (!isValidUsername(username.toLowerCase())) {
      return res.status(400).json({ error: 'Username must be 3-20 characters: lowercase letters, numbers, underscores' });
    }
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: email.toLowerCase() }),
      User.findOne({ username: username.toLowerCase() })
    ]);
    if (existingEmail) return res.status(409).json({ error: 'An account with this email already exists' });
    if (existingUsername) return res.status(409).json({ error: 'That username is taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username: username.toLowerCase(), email: email.toLowerCase(), passwordHash });

    res.cookie('token', signToken(user._id), COOKIE_OPTS);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    res.cookie('token', signToken(user._id), COOKIE_OPTS);
    res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.json({ user: null });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.json({ user: null });
    res.json({ user: publicUser(user) });
  } catch (_) {
    res.json({ user: null });
  }
});

module.exports = router;
