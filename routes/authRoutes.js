const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, className, subjects } = req.body;

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Only student/teacher signup is allowed.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      className: className || '',
      subjects: subjects || [],
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(404).json({ message: 'User not found for this role.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password.' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, className: user.className },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ message: 'Password reset successful. You can login now.' });
  } catch (error) {
    return res.status(500).json({ message: 'Reset failed', error: error.message });
  }
});

module.exports = router;
