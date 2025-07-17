const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
// const auth = require('../middleware/auth');

// Get all appointments for a user (patient)
router.get('/patient', appointmentController.getUserAppointments);

// Get all appointments for a doctor
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

// Create a new appointment
router.post('/', appointmentController.createAppointment);

// Update appointment status
router.put('/:id/status', appointmentController.updateAppointmentStatus);

// Cancel appointment
router.put('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router; 