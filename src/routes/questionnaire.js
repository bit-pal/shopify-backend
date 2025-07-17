const express = require('express');
const router = express.Router();
const Questionnaire = require('../models/Questionnaire');
const { auth, authorize } = require('../middleware/auth');

// Get questionnaires for a specific state
router.get('/state/:state', auth, async (req, res) => {
  try {
    const questionnaires = await Questionnaire.find({
      state: req.params.state,
      isActive: true
    });
    res.json(questionnaires);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new questionnaire (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const questionnaire = new Questionnaire(req.body);
    await questionnaire.save();
    res.status(201).json(questionnaire);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update questionnaire (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByIdAndUpdate(
      req.params.id,
      { ...req.body, version: { $inc: 1 } },
      { new: true }
    );
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    res.json(questionnaire);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete questionnaire (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findByIdAndDelete(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    res.json({ message: 'Questionnaire deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 