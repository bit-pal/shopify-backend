const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const moment = require('moment-timezone');

exports.getUserAppointments = async (req, res) => {
  try {
    const { clientLocation } = req;
    
    // Log location for appointment retrieval
    console.log(`📅 [APPOINTMENTS] User ${req.user._id} retrieving appointments from ${clientLocation?.city || 'Unknown location'}`);
    
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization state')
      .sort({ date: 1 });
    
    // Add location context to response
    res.json({
      appointments,
      userLocation: clientLocation,
      message: `Appointments retrieved for user in ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { clientLocation } = req;
    
    console.log(`👨‍⚕️ [DOCTOR APPOINTMENTS] Doctor ${req.params.doctorId} appointments accessed from ${clientLocation?.city || 'Unknown location'}`);
    
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'firstName lastName email state')
      .sort({ date: 1 });
    
    res.json({
      appointments,
      accessLocation: clientLocation,
      message: `Doctor appointments accessed from ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { clientLocation } = req;
    const { doctorId, date, startTime, endTime, notes, patientId } = req.body;

    console.log(`📝 [CREATE APPOINTMENT] Appointment creation from ${clientLocation?.city || 'Unknown location'}`);


    const appointmentDateTime = moment.tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles');
    const nowCalifornia = moment.tz('America/Los_Angeles');
    if (!appointmentDateTime.isValid() || appointmentDateTime.isBefore(nowCalifornia)) {
      return res.status(400).json({
        message: 'The selected time slot must be in the future (California time).',
        location: clientLocation
      });
    }
    // Check if the doctor is available at the requested time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      startTime,
      status: 'scheduled'
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'This time slot is already booked',
        location: clientLocation
      });
    }

    // Get doctor info for location validation
    const doctor = await Doctor.findById(doctorId);
    if (doctor && clientLocation && !clientLocation.isLocal) {
      // Check if doctor is in the same state as patient (optional validation)
      if (doctor.state !== clientLocation.region) {
        console.log(`⚠️ [LOCATION MISMATCH] Patient in ${clientLocation.region}, Doctor in ${doctor.state}`);
      }
    }

    // Generate a unique meeting link
    const meetingLink = `https://meet.sxrx.com/${Date.now()}-${doctorId}`;

    const appointment = new Appointment({
      doctorId,
      patientId,
      date,
      startTime,
      endTime,
      meetingLink,
      // You could add location metadata to appointment
      createdFromLocation: clientLocation?.city || 'Unknown'
    });

    const newAppointment = await appointment.save();
    
    res.status(201).json({
      appointment: newAppointment,
      location: clientLocation,
      message: `Appointment created from ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { clientLocation } = req;
    const { status } = req.body;
    
    console.log(`🔄 [UPDATE APPOINTMENT] Status update from ${clientLocation?.city || 'Unknown location'}`);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();
    
    res.json({
      appointment: updatedAppointment,
      updatedFrom: clientLocation,
      message: `Appointment status updated from ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { clientLocation } = req;
    
    console.log(`❌ [CANCEL APPOINTMENT] Cancellation from ${clientLocation?.city || 'Unknown location'}`);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    const updatedAppointment = await appointment.save();
    
    res.json({
      appointment: updatedAppointment,
      cancelledFrom: clientLocation,
      message: `Appointment cancelled from ${clientLocation?.city || 'Unknown location'}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
