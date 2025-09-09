// backend/src/routes/tebra.js
const express = require('express');
const router = express.Router();
const tebraController = require('../controllers/tebraController');
const { auth, authorize } = require('../middleware/auth');

router.post('/users/:userId/sync', auth, authorize('admin'), tebraController.syncUserToTebra);
router.get('/users/:userId', auth, authorize('admin'), tebraController.getTebraUser);

module.exports = router;