const express = require('express');
const router = express.Router();
const Support = require('../models/itSupportModel');
const { protect } = require('../middleware/authMiddleware'); // Import JWT middleware

// ✅ Protected Route: GET all support issues (JWT Required)
router.get('/', protect, async (req, res) => {
  try {
    const support = await Support.find({});
    res.status(200).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Protected Route: GET support issue by ID (JWT Required)
router.get('/:id', protect, async (req, res) => {
  try {
    const support = await Support.findById(req.params.id);
    if (!support) {
      return res.status(404).json({ message: "Support issue not found" });
    }
    res.status(200).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Protected Route: POST - Create a New Support Issue (JWT Required)
router.post('/', protect, async (req, res) => {
  try {
    const support = await Support.create(req.body);
    res.status(201).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Protected Route: PUT - Update a Support Issue (JWT Required)
router.put('/:id', protect, async (req, res) => {
  try {
    const support = await Support.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!support) {
      return res.status(404).json({ message: "Support issue not found" });
    }
    res.status(200).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Protected Route: DELETE - Delete a Support Issue (JWT Required)
router.delete('/:id', protect, async (req, res) => {
  try {
    const support = await Support.findByIdAndDelete(req.params.id);
    if (!support) {
      return res.status(404).json({ message: "Support issue not found" });
    }
    res.status(200).json({ message: "Support issue deleted successfully", support });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
