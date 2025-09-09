const crypto = require('crypto');

class TebraMockService {
  constructor() {
    this.patients = new Map();
    this.providers = new Map();
    this.appointments = new Map();
    this.accessTokens = new Map();
  }

  // Mock authentication
  async getAccessToken() {
    const token = crypto.randomBytes(32).toString('hex');
    this.accessTokens.set(token, {
      expires_at: Date.now() + (3600 * 1000), // 1 hour
      scope: 'patients providers appointments'
    });
    return token;
  }

  // Mock patient creation
  async createPatient(userData) {
    const patientId = `tebra_patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockPatient = {
      id: patientId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone || '',
      date_of_birth: userData.dateOfBirth || null,
      address: {
        street: userData.address?.street || '',
        city: userData.address?.city || '',
        state: userData.state,
        zip_code: userData.address?.zipCode || '',
        country: 'US'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      external_id: userData.id || null,
      insurance: {
        primary: null,
        secondary: null
      },
      emergency_contact: {
        name: '',
        relationship: '',
        phone: ''
      }
    };

    this.patients.set(patientId, mockPatient);
    
    // Simulate API delay
    await this.simulateDelay(500, 1500);
    
    return mockPatient;
  }

  // Mock provider creation
  async createProvider(userData) {
    const providerId = `tebra_provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockProvider = {
      id: providerId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone || '',
      npi: userData.npi || `NPI${Math.random().toString().substr(2, 10)}`,
      specialties: userData.specialties || ['General Practice'],
      license_number: userData.licenseNumber || `LIC${Math.random().toString().substr(2, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      external_id: userData.id || null,
      address: {
        street: userData.address?.street || '',
        city: userData.address?.city || '',
        state: userData.state,
        zip_code: userData.address?.zipCode || '',
        country: 'US'
      },
      practice_info: {
        practice_name: userData.practiceName || `${userData.firstName} ${userData.lastName} Practice`,
        tax_id: userData.taxId || `TAX${Math.random().toString().substr(2, 9)}`
      }
    };

    this.providers.set(providerId, mockProvider);
    
    // Simulate API delay
    await this.simulateDelay(500, 1500);
    
    return mockProvider;
  }

  // Mock get patient
  async getPatient(patientId) {
    const patient = this.patients.get(patientId);
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Simulate API delay
    await this.simulateDelay(200, 800);
    
    return patient;
  }

  // Mock get provider
  async getProvider(providerId) {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error('Provider not found');
    }
    
    // Simulate API delay
    await this.simulateDelay(200, 800);
    
    return provider;
  }

  // Mock create appointment
  async createAppointment(appointmentData) {
    const appointmentId = `tebra_appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockAppointment = {
      id: appointmentId,
      patient_id: appointmentData.patientId,
      provider_id: appointmentData.providerId,
      appointment_date: appointmentData.appointmentDate,
      duration: appointmentData.duration || 30,
      status: 'scheduled',
      type: appointmentData.type || 'consultation',
      reason: appointmentData.reason || '',
      notes: appointmentData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location: {
        name: appointmentData.location?.name || 'Main Office',
        address: appointmentData.location?.address || ''
      },
      insurance: {
        primary: null,
        secondary: null
      }
    };

    this.appointments.set(appointmentId, mockAppointment);
    
    // Simulate API delay
    await this.simulateDelay(800, 2000);
    
    return mockAppointment;
  }

  // Mock get appointments
  async getAppointments(filters = {}) {
    let appointments = Array.from(this.appointments.values());
    
    // Apply filters
    if (filters.patientId) {
      appointments = appointments.filter(apt => apt.patient_id === filters.patientId);
    }
    if (filters.providerId) {
      appointments = appointments.filter(apt => apt.provider_id === filters.providerId);
    }
    if (filters.status) {
      appointments = appointments.filter(apt => apt.status === filters.status);
    }
    if (filters.startDate) {
      appointments = appointments.filter(apt => new Date(apt.appointment_date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      appointments = appointments.filter(apt => new Date(apt.appointment_date) <= new Date(filters.endDate));
    }
    
    // Simulate API delay
    await this.simulateDelay(300, 1000);
    
    return {
      appointments: appointments,
      total: appointments.length,
      page: filters.page || 1,
      limit: filters.limit || 50
    };
  }

  // Mock get available time slots
  async getAvailableSlots(providerId, date) {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Randomly make some slots unavailable
        if (Math.random() > 0.3) {
          slots.push({
            id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            provider_id: providerId,
            start_time: slotTime.toISOString(),
            end_time: new Date(slotTime.getTime() + 30 * 60000).toISOString(), // 30 minutes
            duration: 30,
            available: true
          });
        }
      }
    }
    
    // Simulate API delay
    await this.simulateDelay(400, 1200);
    
    return {
      slots: slots,
      date: date,
      provider_id: providerId
    };
  }

  // Helper method to simulate API delays
  async simulateDelay(min = 200, max = 1000) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Get mock statistics
  getStats() {
    return {
      total_patients: this.patients.size,
      total_providers: this.providers.size,
      total_appointments: this.appointments.size,
      active_tokens: this.accessTokens.size
    };
  }

  // Clear all mock data (for testing)
  clearAllData() {
    this.patients.clear();
    this.providers.clear();
    this.appointments.clear();
    this.accessTokens.clear();
  }
}

module.exports = new TebraMockService();