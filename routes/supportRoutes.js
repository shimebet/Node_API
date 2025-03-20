const express = require('express');
const router = express.Router();
const Support = require('../models/itSupportModel');

// Get All Support Issues
router.get('/', async (req, res) => {
  try {
    const support = await Support.find({});
    res.status(200).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Support Issue by ID
router.get('/:id', async (req, res) => {
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

// Create New Support Issue
router.post('/', async (req, res) => {
  try {
    const support = await Support.create(req.body);
    res.status(201).json(support);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Support Issue
router.put('/:id', async (req, res) => {
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

// ✅ DELETE Support Issue
router.delete('/:id', async (req, res) => {
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
