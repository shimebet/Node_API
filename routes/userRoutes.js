const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Support = require('../models/itSupportModel');
const { protect } = require('../middleware/authMiddleware');

dotenv.config();

// =======================
// Generate JWT Token
// =======================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
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
    userImage,
  } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with that email or username already exists' });
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
      userImage,
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
      userImage: newUser.userImage,
      token: generateToken(newUser.id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// =======================
// Login User
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
// Get Current User Info
// =======================
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const issues = await Support.find({ user: user._id }).populate('user', 'username email');

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      branchName: user.branchName,
      branchAddress: user.branchAddress,
      branchGrade: user.branchGrade,
      branchId: user.branchId,
      userImage: user.userImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      issues,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =======================
// Get All Users (Admin Only)
// =======================
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// Update User by ID
// =======================
router.put('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow only admin or the same user to update
    if (req.user.role !== 'admin' && req.user.id !== user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const fields = [
      'firstName',
      'lastName',
      'username',
      'email',
      'password',
      'role',
      'branchName',
      'branchAddress',
      'branchGrade',
      'branchId',
      'userImage',
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        _id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        branchName: updatedUser.branchName,
        branchAddress: updatedUser.branchAddress,
        branchGrade: updatedUser.branchGrade,
        branchId: updatedUser.branchId,
        userImage: updatedUser.userImage,
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// Delete User by ID (Admin Only)
// =======================
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
