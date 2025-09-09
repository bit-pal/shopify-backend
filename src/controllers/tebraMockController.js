// backend/src/controllers/tebraController.js
const tebraMockService = require('../services/tebraMockService'); // Change this line
const User = require('../models/User');

exports.syncUserToTebra = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let tebraData;
    if (user.role === 'doctor') {
      tebraData = await tebraMockService.createProvider(user); // Use mock service
      user.tebraProviderId = tebraData.id;
    } else {
      tebraData = await tebraMockService.createPatient(user); // Use mock service
      user.tebraPatientId = tebraData.id;
    }

    user.tebraSyncStatus = 'synced';
    await user.save();

    res.json({
      message: 'User synced to Tebra successfully (MOCK)',
      tebraId: tebraData.id,
      user: user
    });
  } catch (error) {
    console.error('Tebra mock sync error:', error);
    res.status(500).json({ message: 'Failed to sync user to Tebra' });
  }
};

exports.getTebraUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.tebraPatientId && !user.tebraProviderId) {
      return res.status(404).json({ message: 'User not synced to Tebra' });
    }

    const tebraId = user.tebraPatientId || user.tebraProviderId;
    const tebraData = user.role === 'doctor' 
      ? await tebraMockService.getProvider(tebraId) // Use mock service
      : await tebraMockService.getPatient(tebraId); // Use mock service

    res.json({
      localUser: user,
      tebraData: tebraData
    });
  } catch (error) {
    console.error('Tebra mock get user error:', error);
    res.status(500).json({ message: 'Failed to get Tebra user data' });
  }
};

exports.bulkSyncUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      tebraSyncStatus: { $ne: 'synced' },
      role: 'patient'
    });

    const results = [];
    for (const user of users) {
      try {
        const tebraData = await tebraMockService.createPatient(user); // Use mock service
        user.tebraPatientId = tebraData.id;
        user.tebraSyncStatus = 'synced';
        await user.save();
        results.push({ userId: user._id, status: 'success', tebraId: tebraData.id });
      } catch (error) {
        user.tebraSyncStatus = 'failed';
        await user.save();
        results.push({ userId: user._id, status: 'failed', error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Bulk sync failed' });
  }
};

// Add new endpoints for testing
exports.getTebraStats = async (req, res) => {
  try {
    const stats = tebraMockService.getStats();
    res.json({ 
      message: 'Mock Tebra Statistics',
      stats: stats 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stats' });
  }
};

exports.clearTebraData = async (req, res) => {
  try {
    tebraMockService.clearAllData();
    res.json({ message: 'All mock Tebra data cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear mock data' });
  }
};