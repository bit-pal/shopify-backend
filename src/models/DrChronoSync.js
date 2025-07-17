const mongoose = require('mongoose');

const drChronoSyncSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drChronoPatientId: {
    type: String,
    required: true
  },
  drChronoDoctorId: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  syncStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
drChronoSyncSchema.index({ userId: 1, drChronoPatientId: 1 });
drChronoSyncSchema.index({ state: 1, syncStatus: 1 });

const DrChronoSync = mongoose.model('DrChronoSync', drChronoSyncSchema);

module.exports = DrChronoSync; 