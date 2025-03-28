const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    role: { 
        type: String, 
        enum: ["doctor", "patient", "paramedic"], 
        required: true 
    },
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
    password: { type: String, required: true }
});

module.exports = mongoose.model("User", signupSchema);
