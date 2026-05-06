const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

// Register user
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });

    // Password hashing is handled in the User model pre-save hook.
    await user.save();

    const token = generateToken(user.id);

    res.json({ token });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(err.message);
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Authenticate user
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Add check for isActive status
    if (!user.isActive) {
      return res.status(400).json({ msg: 'Account is deactivated' });
    }

    const token = generateToken(user.id);

    res.json({ token });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(err.message);
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get authenticated user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(err.message);
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
