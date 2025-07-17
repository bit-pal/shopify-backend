const Doctor = require('../models/Doctor');

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorsNearby = async (req, res) => {
  try {
    const { clientLocation } = req;
    
    if (!clientLocation || clientLocation.error || clientLocation.isLocal) {
      // If we can't get location, return all doctors
      const doctors = await Doctor.find().sort({ createdAt: -1 });
      return res.json({
        doctors,
        message: 'Showing all doctors (location unavailable)',
        location: clientLocation
      });
    }

    // Filter doctors by state/region
    const doctors = await Doctor.find({ 
      state: { $regex: clientLocation.region, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.json({
      doctors,
      message: `Showing doctors near ${clientLocation.city}, ${clientLocation.region}`,
      location: clientLocation,
      totalFound: doctors.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  const doctor = new Doctor({
    name: req.body.name,
    specialization: req.body.specialization,
    state: req.body.state,
    email: req.body.email,
    phone: req.body.phone,
    availableTimes: req.body.availableTimes || []
  });

  try {
    const newDoctor = await doctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    doctor.name = req.body.name || doctor.name;
    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.state = req.body.state || doctor.state;
    doctor.email = req.body.email || doctor.email;
    doctor.phone = req.body.phone || doctor.phone;
    doctor.availableTimes = req.body.availableTimes || doctor.availableTimes;
    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    await doctor.remove();
    res.json({ message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    doctor.availableTimes = req.body.availableTimes;
    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 