const Consultation = require('../models/Consultation');
const drChronoService = require('../services/drChronoService');
const twilioService = require('../services/twilioService');
const { v4: uuidv4 } = require('uuid');

const consultationController = {
  async scheduleConsultation(req, res) {
    try {
      const { clientLocation } = req;
      const { patientId, doctorId, scheduledAt, duration } = req.body;
      
      console.log(`📞 [SCHEDULE CONSULTATION] Consultation scheduling from ${clientLocation?.city || 'Unknown location'}`);
      
      const roomName = `consultation-${uuidv4()}`;

      // Create appointment in Dr Chrono
      const appointmentData = {
        patient: patientId,
        doctor: doctorId,
        scheduled_time: scheduledAt,
        duration: duration || 30,
        // Add other required appointment fields
      };

      const drChronoAppointment = await drChronoService.createAppointment(appointmentData);

      // Create Twilio room
      const room = await twilioService.createRoom(roomName);

      // Create consultation record
      const consultation = new Consultation({
        patientId,
        doctorId,
        drChronoAppointmentId: drChronoAppointment.id,
        scheduledAt,
        duration,
        meetingRoom: roomName,
        state: req.user.state,
        // Add location metadata
        scheduledFromLocation: clientLocation?.city || 'Unknown'
      });

      await consultation.save();

      res.status(201).json({
        message: 'Consultation scheduled successfully',
        consultation,
        roomName,
        location: clientLocation,
        scheduledFrom: clientLocation?.city || 'Unknown location'
      });
    } catch (error) {
      console.error('Failed to schedule consultation:', error);
      res.status(500).json({ message: 'Failed to schedule consultation' });
    }
  },

  async joinConsultation(req, res) {
    try {
      const { clientLocation } = req;
      const { consultationId } = req.params;
      const { userId } = req.user;

      console.log(`🚪 [JOIN CONSULTATION] User ${userId} joining consultation from ${clientLocation?.city || 'Unknown location'}`);

      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      if (consultation.patientId.toString() !== userId && consultation.doctorId.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to join this consultation' });
      }

      if (consultation.status !== 'scheduled') {
        return res.status(400).json({ message: 'Consultation is not available' });
      }

      // Generate Twilio access token
      const accessToken = await twilioService.generateAccessToken(
        userId,
        consultation.meetingRoom
      );

      // Update consultation status
      consultation.status = 'in-progress';
      await consultation.save();

      res.json({
        accessToken,
        roomName: consultation.meetingRoom,
        joinedFrom: clientLocation,
        location: clientLocation
      });
    } catch (error) {
      console.error('Failed to join consultation:', error);
      res.status(500).json({ message: 'Failed to join consultation' });
    }
  },

  async endConsultation(req, res) {
    try {
      const { clientLocation } = req;
      const { consultationId } = req.params;
      const { userId } = req.user;

      console.log(`🔚 [END CONSULTATION] Doctor ${userId} ending consultation from ${clientLocation?.city || 'Unknown location'}`);

      const consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' });
      }

      if (consultation.doctorId.toString() !== userId) {
        return res.status(403).json({ message: 'Only doctor can end the consultation' });
      }

      // End Twilio room
      await twilioService.endRoom(consultation.meetingRoom);

      // Update consultation status
      consultation.status = 'completed';
      consultation.endedFromLocation = clientLocation?.city || 'Unknown';
      await consultation.save();

      res.json({
        message: 'Consultation ended successfully',
        consultation,
        endedFrom: clientLocation,
        location: clientLocation
      });
    } catch (error) {
      console.error('Failed to end consultation:', error);
      res.status(500).json({ message: 'Failed to end consultation' });
    }
  },

  async getConsultations(req, res) {
    try {
      const { clientLocation } = req;
      const { userId } = req.user;
      const { status } = req.query;

      console.log(`📋 [GET CONSULTATIONS] User ${userId} retrieving consultations from ${clientLocation?.city || 'Unknown location'}`);

      const query = {
        $or: [{ patientId: userId }, { doctorId: userId }]
      };

      if (status) {
        query.status = status;
      }

      const consultations = await Consultation.find(query)
        .sort({ scheduledAt: -1 })
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName');

      res.json({
        consultations,
        userLocation: clientLocation,
        message: `Consultations retrieved from ${clientLocation?.city || 'Unknown location'}`
      });
    } catch (error) {
      console.error('Failed to get consultations:', error);
      res.status(500).json({ message: 'Failed to get consultations' });
    }
  }
};

module.exports = consultationController; 