const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { protect } = require('../middleware/authMiddleware'); 
const Support = require('../models/itSupportModel');


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
    username,
    email,
    password,
    role,
    branchName,
    branchAddress,
    branchGrade,
    branchId,
    userImage, // <-- Add this line
  } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with that email or username already exists' });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      branchName,
      branchAddress,
      branchGrade,
      branchId,
      userImage, // <-- Save the image here
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
      userImage: newUser.userImage, // <-- Return it
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
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user.id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        // branchName: user.branchName,
        // branchAddress: user.branchAddress,
        // branchGrade: user.branchGrade,
        // branchId: user.branchId,
      //  userImage: user.userImage,
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
    const user = await User.findById(req.user.id).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const issues = await Support.find({ user: user._id })
      .populate('user', 'username email');

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      // branchName: user.branchName,
      // branchAddress: user.branchAddress,
      // branchGrade: user.branchGrade,
      // branchId: user.branchId,
      // userImage: user.userImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      issues, // populated support issues
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// =======================
// Get All Users (Admin only)
// =======================
router.get('/', protect, async (req, res) => {
  try {
    // Optional: check if only admins can fetch all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password'); // exclude passwords

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
