const drChronoService = require('../services/drChronoService');
const DrChronoSync = require('../models/DrChronoSync');
const User = require('../models/User');

const drChronoController = {
  async syncPatient(req, res) {
    try {
      const { userId } = req.user;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create patient in Dr Chrono
      const patientData = {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        state: user.state,
        // Add other required patient fields
      };

      const drChronoPatient = await drChronoService.createPatient(patientData);

      // Get available doctors for the state
      const doctors = await drChronoService.getDoctorsByState(user.state);
      const assignedDoctor = doctors[0]; // Simple assignment, can be made more sophisticated

      // Create sync record
      const syncRecord = new DrChronoSync({
        userId,
        drChronoPatientId: drChronoPatient.id,
        drChronoDoctorId: assignedDoctor.id,
        state: user.state,
        syncStatus: 'completed'
      });

      await syncRecord.save();

      // Update user with Dr Chrono ID
      user.drChronoId = drChronoPatient.id;
      await user.save();

      res.json({
        message: 'Patient synced successfully',
        drChronoPatientId: drChronoPatient.id,
        assignedDoctor: assignedDoctor
      });
    } catch (error) {
      console.error('Failed to sync patient:', error);
      res.status(500).json({ message: 'Failed to sync patient with Dr Chrono' });
    }
  },

  async createPrescription(req, res) {
    try {
      const { userId } = req.user;
      const { medication, dosage, instructions } = req.body;

      const syncRecord = await DrChronoSync.findOne({ userId });
      if (!syncRecord) {
        return res.status(404).json({ message: 'Patient not synced with Dr Chrono' });
      }

      const prescriptionData = {
        patient: syncRecord.drChronoPatientId,
        doctor: syncRecord.drChronoDoctorId,
        medication,
        dosage,
        instructions,
        // Add other required prescription fields
      };

      const prescription = await drChronoService.createPrescription(prescriptionData);

      res.json({
        message: 'Prescription created successfully',
        prescription
      });
    } catch (error) {
      console.error('Failed to create prescription:', error);
      res.status(500).json({ message: 'Failed to create prescription' });
    }
  },

  async getAssignedDoctor(req, res) {
    try {
      const { userId } = req.user;
      const syncRecord = await DrChronoSync.findOne({ userId });

      if (!syncRecord) {
        return res.status(404).json({ message: 'No doctor assigned' });
      }

      const doctors = await drChronoService.getDoctorsByState(syncRecord.state);
      const assignedDoctor = doctors.find(doc => doc.id === syncRecord.drChronoDoctorId);

      res.json({
        doctor: assignedDoctor
      });
    } catch (error) {
      console.error('Failed to get assigned doctor:', error);
      res.status(500).json({ message: 'Failed to get assigned doctor' });
    }
  }
};

module.exports = drChronoController; 