const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["doctor", "patient", "paramedic"],
        required: true
    },
    // Doctor-specific field
    docID: {
        type: String,
        unique: true,
        sparse: true,
        required: function () { return this.role === "doctor"; }
    },
    // Paramedic-specific field
    paramedicID: {
        type: String,
        unique: true,
        sparse: true,
        required: function () { return this.role === "paramedic"; }
    },
    // Patient-specific fields
    patientID: {
        type: String,
        unique: true,
        sparse: true,
        required: function () { return this.role === "patient"; }
    },
    patientName: {
        type: String,
        required: function () { return this.role === "patient"; }
    },
    accountID: {
        type: String,
        unique: true,
        required: function () { return this.role === "patient"; }
    },
    age: {
        type: Number,
        min: 0,
        required: function () { return this.role === "patient"; }
    },
    bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required: function () { return this.role === "patient"; }
    },
    allergenInfo: { type: String, required: function () { return this.role === "patient"; } },

    emergencyContactID: { type: String, required: function () { return this.role === "patient"; } },
    emergencyContactName: { type: String, required: function () { return this.role === "patient"; } },
    emergencyContactNumber: { type: String, required: function () { return this.role === "patient"; } },
    drinkingHabits: {
        type: String,
        enum: ["Yes", "No"],
        required: function () { return this.role === "patient"; }
    },
    smokingHabits: {
        type: String,
        enum: ["Yes", "No"],
        required: function () { return this.role === "patient"; }
    },
    DNR: {
        type: String,
        enum: ["Yes", "No"],
        required: function () { return this.role === "patient"; }
    },
    primaryPhysician: { type: String, required: function () { return this.role === "patient"; }  },
    physicianID: { type: String, required: function () { return this.role === "patient"; }  },
    insuranceID: { type: String, required: function () { return this.role === "patient"; }  },

    // Common fields
    password: { type: String, required: true }
});

module.exports = mongoose.model("User", signupSchema);
