const express = require('express');
const router = express.Router();
const drChronoController = require('../controllers/drChronoController');
const { auth, authorize } = require('../middleware/auth');

// Sync patient with Dr Chrono
router.post('/sync-patient', auth, drChronoController.syncPatient);

// Create prescription
router.post('/prescriptions', auth, authorize('doctor', 'admin'), drChronoController.createPrescription);

// Get assigned doctor
router.get('/assigned-doctor', auth, drChronoController.getAssignedDoctor);

module.exports = router; 