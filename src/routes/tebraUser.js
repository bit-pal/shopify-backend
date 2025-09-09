// backend/src/routes/tebraUser.js
const express = require('express');
const router = express.Router();
const tebraUserController = require('../controllers/tebraUserController');
const { auth, authorize } = require('../middleware/auth');

// Create Tebra patient during signup (no auth required for signup flow)
router.post('/signup/:userId', tebraUserController.createTebraPatientOnSignup);

// Get Tebra patient data (requires auth)
router.get('/patient/:userId', auth, tebraUserController.getTebraPatientData);

// Retry failed Tebra sync (admin only)
router.post('/retry-sync/:userId', auth, authorize('admin'), tebraUserController.retryTebraSync);

// Get sync status for all users (admin only)
router.get('/sync-status', auth, authorize('admin'), tebraUserController.getTebraSyncStatus);

module.exports = router;