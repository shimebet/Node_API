const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// =======================
// Register User
// =======================
router.post('/register', async (req, res) => {
  const { firstName, lastName, userName, email, password, role } = req.body;

  try {
    // Check if userName or email already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with that email or username already exists" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      userName,
      email,
      password,
      role,
    });

    res.status(201).json({
      _id: newUser.id,
      firstName: newUser.firstName,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser.id),
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =======================
// Login User with userName
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
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
