const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { getFormattedLocation, getLocationResponse, validateLocation } = require('../utils/locationUtils');

// Register
router.post('/register', async (req, res) => {
  try {
    const { clientLocation } = req;
    const { email, password, firstName, lastName, state, role } = req.body;

    console.log(`👤 [REGISTER] User registration from ${getFormattedLocation(clientLocation)}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists',
        location: clientLocation
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      state,
      role: role || 'patient'
    });

    await user.save();
    if (process.env.AUTO_SYNC_TEBRA === 'true') {
      try {
        const tebraData = await tebraService.createPatient(user);
        user.tebraPatientId = tebraData.id;
        user.tebraSyncStatus = 'synced';
        await user.save();
      } catch (error) {
        console.error('Auto-sync to Tebra failed:', error);
        user.tebraSyncStatus = 'failed';
        await user.save();
      }
    }
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        state: user.state
      },
      location: clientLocation,
      message: `User registered from ${getFormattedLocation(clientLocation)}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { clientLocation } = req;
    const { email, password } = req.body;

    console.log(`🔐 [LOGIN] User login attempt from ${getFormattedLocation(clientLocation)}`);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        location: clientLocation
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        location: clientLocation
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        state: user.state
      },
      location: clientLocation,
      message: `User logged in from ${getFormattedLocation(clientLocation)}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  const { clientLocation } = req;
  
  console.log(`👤 [GET USER] User profile accessed from ${getFormattedLocation(clientLocation)}`);
  
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      state: req.user.state
    },
    location: clientLocation,
    message: `Profile accessed from ${getFormattedLocation(clientLocation)}`
  });
});

// Logout
router.post('/logout', (req, res) => {
  const { clientLocation } = req;
  
  console.log(`🚪 [LOGOUT] User logout from ${getFormattedLocation(clientLocation)}`);
  
  res.status(204).send();
});

// Password Reset Request
router.post('/reset-password-request', async (req, res) => {
  try {
    const { clientLocation } = req;
    const { email } = req.body;
    
    console.log(`🔑 [PASSWORD RESET REQUEST] Request from ${getFormattedLocation(clientLocation)}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        location: clientLocation
      });
    }
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    await user.save();
    // In a real app, send an email with the reset link
    console.log(`Reset link: http://yourdomain.com/reset-password?token=${resetToken}`);
    res.status(200).json({ 
      message: 'Password reset link sent',
      location: clientLocation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Password Reset
router.post('/reset-password', async (req, res) => {
  try {
    const { clientLocation } = req;
    const { token, newPassword } = req.body;
    
    console.log(`🔑 [PASSWORD RESET] Password reset from ${getFormattedLocation(clientLocation)}`);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.resetToken !== token) {
      return res.status(400).json({ 
        message: 'Invalid or expired token',
        location: clientLocation
      });
    }
    user.password = newPassword;
    user.resetToken = undefined;
    await user.save();
    res.status(200).json({ 
      message: 'Password reset successful',
      location: clientLocation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 