const mongoose = require("mongoose");

const PatientInfoSchema = new mongoose.Schema({
    UserID: { type: String, required: true, unique: true },
    UserName: { type: String, default: "" },
    AccountID: { type: String, default: "" },
    Age: { type: String, default: "" },
    BloodType: { type: String, default: "" },
    AllergenInfo: { type: String, default: "" },
    EmergencyContactID: { type: String, default: "" },
    EmergencyContactName: { type: String, default: "" },
    EmergencyContactNumber: { type: String, default: "" },
    DrinkingHabits: { type: String, default: "" },
    SmokingHabits: { type: String, default: "" },
    DNR: { type: String, default: "No" },
    PrimaryPhysician: { type: String, default: "" },
    PhysicianID: { type: String, default: "" },
    InsuranceID: { type: String, default: "" }
});

module.exports = mongoose.model("PatientInfo", PatientInfoSchema);
