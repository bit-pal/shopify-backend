// backend/src/controllers/tebraUserController.js
const tebraService = require('../services/tebraService');
const User = require('../models/User');

// Create Tebra patient during user signup
exports.createTebraPatientOnSignup = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has Tebra patient ID
    if (user.tebraPatientId) {
      return res.status(400).json({ 
        message: 'User already has Tebra patient ID',
        tebraPatientId: user.tebraPatientId
      });
    }

    // Create patient in Tebra
    const tebraData = await tebraService.createPatient(user);
    
    // Update local user with Tebra patient ID
    user.tebraPatientId = tebraData.id;
    user.tebraSyncStatus = 'synced';
    user.tebraSyncDate = new Date();
    await user.save();

    res.status(201).json({
      message: 'Tebra patient created successfully during signup',
      tebraPatientId: tebraData.id,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tebraPatientId: user.tebraPatientId,
        tebraSyncStatus: user.tebraSyncStatus
      }
    });
  } catch (error) {
    // console.error('Tebra patient creation error:', error);
    
    // Update user sync status to failed
    if (req.params.userId) {
      try {
        const user = await User.findById(req.params.userId);
        if (user) {
          user.tebraSyncStatus = 'failed';
          user.tebraSyncError = error.message;
          await user.save();
        }
      } catch (saveError) {
        console.error('Failed to update user sync status:', saveError);
      }
    }
    
    res.status(500).json({ 
      message: 'Failed to create Tebra patient during signup',
      error: error.message 
    });
  }
};

// Get Tebra patient data for a user
exports.getTebraPatientData = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.tebraPatientId) {
      return res.status(404).json({ message: 'User not synced to Tebra' });
    }

    // Get patient data from Tebra
    const tebraData = await tebraService.getPatient(user.tebraPatientId);

    res.json({
      localUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tebraPatientId: user.tebraPatientId,
        tebraSyncStatus: user.tebraSyncStatus
      },
      tebraData: tebraData
    });
  } catch (error) {
    console.error('Tebra get patient error:', error);
    res.status(500).json({ message: 'Failed to get Tebra patient data' });
  }
};

// Retry Tebra sync for failed users
exports.retryTebraSync = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.tebraSyncStatus === 'synced') {
      return res.status(400).json({ message: 'User already synced to Tebra' });
    }

    // Retry creating patient in Tebra
    const tebraData = await tebraService.createPatient(user);
    
    // Update local user
    user.tebraPatientId = tebraData.id;
    user.tebraSyncStatus = 'synced';
    user.tebraSyncDate = new Date();
    user.tebraSyncError = null;
    await user.save();

    res.json({
      message: 'Tebra sync retry successful',
      tebraPatientId: tebraData.id,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tebraPatientId: user.tebraPatientId,
        tebraSyncStatus: user.tebraSyncStatus
      }
    });
  } catch (error) {
    console.error('Tebra sync retry error:', error);
    res.status(500).json({ message: 'Tebra sync retry failed' });
  }
};

// Get sync status for all users
exports.getTebraSyncStatus = async (req, res) => {
  try {
    const users = await User.find({
      role: 'patient'
    }).select('firstName lastName email tebraPatientId tebraSyncStatus tebraSyncDate tebraSyncError');

    const syncStats = {
      total: users.length,
      synced: users.filter(u => u.tebraSyncStatus === 'synced').length,
      failed: users.filter(u => u.tebraSyncStatus === 'failed').length,
      pending: users.filter(u => !u.tebraSyncStatus || u.tebraSyncStatus === 'pending').length,
      users: users
    };

    res.json(syncStats);
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({ message: 'Failed to get sync status' });
  }
};