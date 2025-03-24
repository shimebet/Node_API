const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { protect } = require('../middleware/authMiddleware'); // ✅ Destructure protect

dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// =======================
// Register User
// =======================
router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
    role,
    branchName,
    branchAddress,
    branchGrade,
    branchId,
  } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with that email or username already exists' });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      userName,
      email,
      password,
      role,
      branchName,
      branchAddress,
      branchGrade,
      branchId,
    });

    res.status(201).json({
      _id: newUser.id,
      firstName: newUser.firstName,
      email: newUser.email,
      role: newUser.role,
      branchName: newUser.branchName,
      branchAddress: newUser.branchAddress,
      branchGrade: newUser.branchGrade,
      branchId: newUser.branchId,
      token: generateToken(newUser.id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// =======================
// Login User (by userName)
// =======================
router.post('/login', async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({ userName });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user.id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        branchName: user.branchName,
        branchAddress: user.branchAddress,
        branchGrade: user.branchGrade,
        branchId: user.branchId,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// =======================
// Get Current User Info (Protected)
// =======================
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

module.exports = router;
