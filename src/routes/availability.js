const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const auth = require('../middleware/auth');

// @route   GET api/availability/doctor/:doctorId
// @desc    Get all availability slots for a doctor
// @access  Public
router.get('/doctor/:doctorId', availabilityController.getDoctorAvailability);

// @route   POST api/availability
// @desc    Create a new availability slot
// @access  Private (Doctor only)
router.post('/', availabilityController.createAvailability);

// @route   PUT api/availability/:id
// @desc    Update an availability slot
// @access  Private (Doctor only)
router.put('/:id', availabilityController.updateAvailability);

// @route   DELETE api/availability/:id
// @desc    Delete an availability slot
// @access  Private (Doctor only)
router.delete('/:id', availabilityController.deleteAvailability);

module.exports = router; 