const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ["doctor", "patient", "paramedic"], 
    required: true 
  },
  // For a doctor, we require a docID. For others, we use different fields.
  docID: { 
    type: String, 
    unique: true, 
    sparse: true, 
    required: function() { return this.role === "doctor"; } 
  },
  patientID: { 
    type: String, 
    unique: true, 
    sparse: true, 
    required: function() { return this.role === "patient"; } 
  },
  paramedicID: { 
    type: String, 
    unique: true, 
    sparse: true, 
    required: function() { return this.role === "paramedic"; } 
  },
  password: { type: String, required: true },

  // Doctor-specific fields are now optional.
  doctorName: { type: String },
  contactInfo: { type: String },
  medicalLicenseNumber: { type: String },
  qualifications: { type: String },
  hospitalOrClinic: { type: String },
  speciality: { type: String }
});

module.exports = mongoose.model("User", signupSchema);
