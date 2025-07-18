 const mongoose = require('mongoose');

const QuestionnaireSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: String,
  agree: String,
  alcohol: String,
  alcoholFreq: String,
  allergies: String,
  allergiesNote: String,
  chronicConditions: String,
  comments: String,
  concerns: [String],
  concernsOther: String,
  date: String,
  discussedProvider: String,
  dob: String,
  email: String,
  exercise: String,
  familyHistory: String,
  familyHistoryNote: String,
  fullName: String,
  gender: String,
  goals: [String],
  goalsOther: String,
  hasRedFlags: Boolean,
  highRisk: [String],
  medications: String,
  medicationsNote: String,
  mentalHealthDiagnoses: String,
  mentalHealthHospitalization: String,
  mentalHealthMedications: String,
  phone: String,
  preferences: [String],
  preferencesOther: String,
  prevTreatments: String,
  prevTreatmentsNote: String,
  recreationalDrugs: String,
  signature: String,
  smoke: String,
  smokeFreq: String,
  substanceAbuse: String,
  surgeries: String,
  surgeriesNote: String,
  thoughtsOfHarm: String,
  timestamp: String
});

module.exports = mongoose.model('Questionnaire', QuestionnaireSchema);