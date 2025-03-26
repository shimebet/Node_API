const express = require('express');
const router = express.Router();
const Support = require('../models/itSupportModel');
const User = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');

// GET all support issues with user info
router.get('/', protect, async (req, res) => {
  try {
    const support = await Support.find({}).populate('user', 'username email');
    res.status(200).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET support issue by ID with user info
router.get('/:id', protect, async (req, res) => {
  try {
    const support = await Support.findById(req.params.id).populate('user', 'username email');
    if (!support) {
      return res.status(404).json({ message: "Support issue not found" });
    }
    res.status(200).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Create a new support issue and return populated user info
router.post('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const support = await Support.create({
      firstName: user.firstName,
      lastName: user.lastName,
      issueTitle: req.body.issueTitle,
      issueDescription: req.body.issueDescription,
      issueSolution: req.body.issueSolution,
      issueImage: req.body.issueImage,
      user: user._id,
    });

    // 👇 Populate the user info before sending response
    const populatedSupport = await Support.findById(support._id).populate('user', 'username email');

    res.status(201).json(populatedSupport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - Update a support issue (only owner can update)
router.put('/:id', protect, async (req, res) => {
  try {
    const support = await Support.findById(req.params.id);

    if (!support) {
      return res.status(404).json({ message: "Support issue not found" });
    }

    if (support.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedSupport = await Support.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'username email'); // 👈 populate after update

    res.status(200).json(updatedSupport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Delete a support issue (only owner can delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const support = await Support.findById(req.params.id);

    if (!support) {
      return res.status(404).json({ message: "Support issue not found" });
    }

    if (support.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await support.deleteOne();

    res.status(200).json({ message: "Support issue deleted successfully", support });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
