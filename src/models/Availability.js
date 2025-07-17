const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  recurrenceEndDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
availabilitySchema.index({ doctorId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Availability', availabilitySchema); 