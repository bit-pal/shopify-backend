const Availability = require('../models/Availability');
const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');

exports.getDoctorAvailability = async (req, res) => {
  try {
    const { clientLocation } = req;
    
    console.log(`📅 [AVAILABILITY] Doctor ${req.params.doctorId} availability accessed from ${clientLocation?.city || 'Unknown location'}`);
    
    const doctorObjectId = new mongoose.Types.ObjectId(req.params.doctorId);
    const slots = await Availability.find({
      doctorId: doctorObjectId
    }).sort({ startTime: 1 });
    console.log(slots);
    res.json({
      availability: slots,
      accessLocation: clientLocation,
      message: `Availability accessed from ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new availability slot
exports.createAvailability = async (req, res) => {
  try {
    const { clientLocation } = req;
    const { doctorId, startTime, endTime, recurrence, recurrenceEndDate, isAvailable } = req.body;

    console.log(`➕ [CREATE AVAILABILITY] Availability creation from ${clientLocation?.city || 'Unknown location'}`);

    if (!doctorId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Doctor ID, start time and end time are required' });
    }

    // Get doctor info for location validation
    const doctor = await Doctor.findById(doctorId);
    if (doctor && clientLocation && !clientLocation.isLocal) {
      console.log(`👨‍⚕️ [DOCTOR LOCATION] Doctor ${doctor.name} in ${doctor.state}, created from ${clientLocation.region}`);
    }

    const availability = new Availability({
      doctorId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      recurrence: recurrence || 'none',
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      // Add location metadata
      createdFromLocation: clientLocation?.city || 'Unknown'
    });

    const newSlot = await availability.save();
    
    res.status(201).json({
      availability: newSlot,
      location: clientLocation,
      message: `Availability created from ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an availability slot
exports.updateAvailability = async (req, res) => {
  try {
    const { clientLocation } = req;
    
    console.log(`🔄 [UPDATE AVAILABILITY] Availability update from ${clientLocation?.city || 'Unknown location'}`);
    
    let availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }
    
    const { startTime, endTime, recurrence, recurrenceEndDate, isAvailable, doctorId } = req.body;
    availability.startTime = startTime ? new Date(startTime) : availability.startTime;
    availability.endTime = endTime ? new Date(endTime) : availability.endTime;
    availability.recurrence = recurrence || availability.recurrence;
    availability.recurrenceEndDate = recurrenceEndDate ? new Date(recurrenceEndDate) : availability.recurrenceEndDate;
    availability.isAvailable = isAvailable !== undefined ? isAvailable : availability.isAvailable;
    availability.doctorId = doctorId || availability.doctorId;
    
    const updatedSlot = await availability.save();
    
    res.json({
      availability: updatedSlot,
      updatedFrom: clientLocation,
      message: `Availability updated from ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    console.error('Availability update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete an availability slot
exports.deleteAvailability = async (req, res) => {
  try {
    const { clientLocation } = req;
    
    console.log(`🗑️ [DELETE AVAILABILITY] Availability deletion from ${clientLocation?.city || 'Unknown location'}`);
    
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }
    
    await availability.deleteOne();
    
    res.json({ 
      message: 'Availability slot removed',
      deletedFrom: clientLocation,
      location: clientLocation
    });
  } catch (error) {
    console.error('Availability deletion error:', error);
    res.status(500).json({ message: error.message });
  }
};