const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
// const auth = require('../middleware/auth');

// Get all appointments for a user (patient)
router.post('/createPaymentLink', paymentController.createPaymentLink);

// Get all appointments for a doctor

module.exports = router; 