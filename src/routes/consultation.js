const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { auth, authorize } = require('../middleware/auth');

// Schedule consultation
router.post('/schedule', auth, consultationController.scheduleConsultation);

// Join consultation
router.post('/:consultationId/join', auth, consultationController.joinConsultation);

// End consultation
router.post('/:consultationId/end', auth, authorize('doctor'), consultationController.endConsultation);

// Get consultations
router.get('/', auth, consultationController.getConsultations);

module.exports = router; 