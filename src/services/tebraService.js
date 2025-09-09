// backend/src/services/tebraService.js
const soap = require('soap');

class TebraService {
  constructor() {
    this.wsdlUrl = process.env.TEBRA_SOAP_WSDL || process.env.TEBRA_SOAP_ENDPOINT;
    this.customerKey = process.env.TEBRA_CUSTOMER_KEY;
    this.namespace = process.env.TEBRA_SOAP_NAMESPACE || 'http://tebra.com/api';
    this.clientPromise = null;
  }

  async getClient() {
    try {
      if (!this.clientPromise) {
        this.clientPromise = soap.createClientAsync(this.wsdlUrl);
      }
      const client = await this.clientPromise;
      // Add auth header for every call
      const header = {
        'tebra:AuthHeader': {
          'tebra:CustomerKey': this.customerKey,
          'tebra:Timestamp': new Date().toISOString()
        }
      };
      client.addSoapHeader(header, '', 'tebra', this.namespace);
      return client;
    } catch (error) {
      console.error('Tebra SOAP: Failed to initialize client', error.message);
      throw error;
    }
  }

  // Patients
  async createPatient(userData) {
    try {
      const client = await this.getClient();
      const args = {
        PatientData: {
          FirstName: userData.firstName,
          LastName: userData.lastName,
          // Email: userData.email,
          // Phone: userData.phone || '',
          // DateofBirth: userData.dateOfBirth || '',
          // Address: {
          //   Street: userData.address?.street || '',
          //   City: userData.address?.city || '',
          //   State: userData.state,
          //   ZipCode: userData.address?.zipCode || '',
          //   Country: 'US'
          // }
        }
      };
      console.log("args", args);
      const [result] = await client.CreatePatientAsync(args);
      console.log("result", result);
      return this.normalizeCreatePatientResponse(result);
    } catch (error) {
      console.error('Tebra SOAP: CreatePatient error', error.message);
      throw error;
    }
  }

  async getPatient(patientId) {
    try {
      const client = await this.getClient();
      const args = { PatientID: patientId };
      const [result] = await client.GetPatientAsync(args);
      return this.normalizeGetPatientResponse(result);
    } catch (error) {
      console.error('Tebra SOAP: GetPatient error', error.message);
      throw error;
    }
  }

  async updatePatient(patientId, updates) {
    try {
      const client = await this.getClient();
      const args = {
        PatientID: patientId,
        UpdateData: {
          FirstName: updates.firstName,
          LastName: updates.lastName,
          Email: updates.email,
          Phone: updates.phone,
          DateOfBirth: updates.dateOfBirth,
          Address: updates.address && {
            Street: updates.address.street,
            City: updates.address.city,
            State: updates.address.state,
            ZipCode: updates.address.zipCode,
            Country: updates.address.country || 'US'
          }
        }
      };
      const [result] = await client.UpdatePatientAsync(args);
      return this.normalizeGetPatientResponse(result);
    } catch (error) {
      console.error('Tebra SOAP: UpdatePatient error', error.message);
      throw error;
    }
  }

  async deactivatePatient(patientId) {
    try {
      const client = await this.getClient();
      const args = { PatientID: patientId };
      const [result] = await client.DeactivatePatientAsync(args);
      return { success: true, tebraResponse: result };
    } catch (error) {
      console.error('Tebra SOAP: DeactivatePatient error', error.message);
      throw error;
    }
  }

  // Normalizers
  normalizeCreatePatientResponse(result) {
    // Accept both plain object or nested response
    const data = this.unwrap(result);
    const id = data.PatientID || data.id || data.patientId;
    return { id };
  }

  normalizeGetPatientResponse(result) {
    const data = this.unwrap(result);
    return {
      id: data.PatientID || data.id || data.patientId,
      first_name: data.FirstName || data.first_name,
      last_name: data.LastName || data.last_name,
      email: data.Email || data.email,
      phone: data.Phone || data.phone,
      date_of_birth: data.DateOfBirth || data.date_of_birth,
      address: data.Address || {
        street: data.Street,
        city: data.City,
        state: data.State,
        zip_code: data.ZipCode,
        country: data.Country
      },
      status: data.Status || 'active',
      created_at: data.CreatedDate || data.created_at,
      updated_at: data.UpdatedDate || data.updated_at
    };
  }

  unwrap(obj) {
    if (!obj) return {};
    // node-soap often returns { MethodResult: {...} }
    const keys = Object.keys(obj || {});
    if (keys.length === 1 && keys[0].toLowerCase().includes('result')) {
      return obj[keys[0]] || {};
    }
    return obj;
  }
}

module.exports = new TebraService();