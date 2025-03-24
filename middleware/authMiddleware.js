const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config();

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Extract and verify token
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { protect };
