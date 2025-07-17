const axios = require('axios');

class DrChronoService {
  constructor() {
    this.baseURL = process.env.DRCHRONO_API_URL;
    this.clientId = process.env.DRCHRONO_CLIENT_ID;
    this.clientSecret = process.env.DRCHRONO_CLIENT_SECRET;
    this.accessToken = null;
  }

  async getAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Dr Chrono access token:', error);
      throw error;
    }
  }

  async createPatient(patientData) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await axios.post(
        `${this.baseURL}/api/patients`,
        patientData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create patient in Dr Chrono:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await axios.post(
        `${this.baseURL}/api/appointments`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create appointment in Dr Chrono:', error);
      throw error;
    }
  }

  async createPrescription(prescriptionData) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await axios.post(
        `${this.baseURL}/api/prescriptions`,
        prescriptionData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create prescription in Dr Chrono:', error);
      throw error;
    }
  }

  async getDoctorsByState(state) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await axios.get(
        `${this.baseURL}/api/doctors?state=${state}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get doctors from Dr Chrono:', error);
      throw error;
    }
  }
}

module.exports = new DrChronoService(); 