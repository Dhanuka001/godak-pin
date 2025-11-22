const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'godakpin_secret', { expiresIn: '7d' });

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, mobile, district } = req.body;

    if (!name || !email || !password || !mobile || !district) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, mobile, district });

    const token = generateToken(user._id);
    return res.status(201).json({ user: user.toSafeObject(), token });
  } catch (err) {
    return next(err);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    return res.json({ user: user.toSafeObject(), token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
