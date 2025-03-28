const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const signupModel = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const app = express();

// Middleware setup
app.use(cors({
  origin: "http://localhost:3000",
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/NFC'; 
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server with correct template literal
const PORT = 9000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Authentication Middleware ---
// This middleware verifies the JWT token and attaches the decoded payload to req.user.
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded;
    next();
  });
};

// --- Signup Endpoint ---
app.post("/signup", async (req, res) => {
  try {
    const { role, userID, password, confirmPassword, doctorName, contactInfo, medicalLicenseNumber, qualifications, hospitalOrClinic, speciality } = req.body;

    if (!["doctor", "patient", "paramedic"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!userID) return res.status(400).json({ message: "User ID is required." });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

    const existingUser = await signupModel.findOne({
      $or: [
        { docID: userID },
        { patientID: userID },
        { paramedicID: userID }
      ]
    });
    if (existingUser) return res.status(400).json({ message: "ID already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new signupModel({
      role,
      password: hashedPassword,
      ...(role === "doctor" && {
        docID: userID,
        doctorName,        // This field is optional now.
        contactInfo,
        medicalLicenseNumber,
        qualifications,
        hospitalOrClinic,
        speciality
      }),
      ...(role === "patient" && { patientID: userID }),
      ...(role === "paramedic" && { paramedicID: userID })
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful", user: { userID, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
});

// --- Login Endpoint ---
app.post("/login", async (req, res) => {
  try {
    const { role, userID, password } = req.body;
    if (!role || !userID || !password) 
      return res.status(400).json({ message: "Role, User ID, and Password are required." });

    let user = null;
    if (role === "doctor") user = await signupModel.findOne({ docID: userID });
    else if (role === "patient") user = await signupModel.findOne({ patientID: userID });
    else if (role === "paramedic") user = await signupModel.findOne({ paramedicID: userID });
    else return res.status(400).json({ message: "Invalid role." });

    if (!user) return res.status(401).json({ message: "Invalid User ID." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

    // Build payload; for doctors include docID
    let payload = { id: user._id, role: user.role };
    if (user.role === "doctor") {
      payload.docID = user.docID;
    } else {
      payload.userID = userID;
    }
    const token = jwt.sign(payload, "jwt_secret_key", { expiresIn: "12h" });
    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// --- Forgot Password Endpoint ---
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  signupModel.findOne({ email: email })
    .then((user) => {
      if (!user) return res.send({ Status: "User does not exist!!" });
      const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "10m" });
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'nrn061005@gmail.com', pass: 'your_app_password_here' }
      });
      const mailOptions = {
        from: 'nrn061005@gmail.com',
        to: email,
        subject: 'Dr.PillPilot - Reset your Password',
        html: `
          <h1>Password Reset Request</h1>
          <p>Thank you for working with Dr.PillPilot!</p>
          <p>Click the link below to reset your password. This link will expire in 10 minutes:</p>
          <a href="http://localhost:3000/reset-password/${user._id}/${token}">
            Reset Password
          </a>
          <p>If you did not request a password reset, you can ignore this email.</p>
        `
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).send({ Status: "Error sending email" });
        } else {
          return res.send({ Status: "Success" });
        }
      });
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      return res.status(500).send({ Status: "Internal Server Error" });
    });
});

// --- Reset Password Endpoint ---
app.post('/reset-password/:id/:token', (req, res) => {
  const { id, token } = req.params;
  const { newPassword } = req.body;
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) return res.json({ Status: "Error with token!!" });
    else {
      bcrypt.hash(newPassword, 10)
        .then((hash) => {
          signupModel.findByIdAndUpdate({ _id: id }, { password: hash })
            .then((u) => {
              if (u) res.send({ Status: "Success" });
              else res.status(404).send({ Status: "User not found" });
            })
            .catch(err => res.send({ Status: err }));
        });
    }
  });
});

// --- Logout Endpoint ---
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: "Logged out successfully" });
});

// --- Doctor Profile Endpoint (Protected) ---
// Returns the logged-in doctor's profile based on the token.
app.get("/doctor-profile", authenticateJWT, async (req, res) => {
  try {
    const user = await signupModel.findById(req.user.id);
    if (!user || user.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const profile = {
      doctorName: user.doctorName,
      doctorID: user.docID,
      contactInfo: user.contactInfo,
      medicalLicenseNumber: user.medicalLicenseNumber,
      qualifications: user.qualifications,
      hospitalOrClinic: user.hospitalOrClinic,
      speciality: user.speciality
    };
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch doctor profile." });
  }
});

// --- New Dynamic Doctor Endpoint ---
// Allows fetching a doctor's details by their docID via a dynamic URL.
app.get("/doctor/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await signupModel.findOne({ docID: id, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({
      doctorName: doctor.doctorName,
      doctorID: doctor.docID,
      contactInfo: doctor.contactInfo,
      medicalLicenseNumber: doctor.medicalLicenseNumber,
      qualifications: doctor.qualifications,
      hospitalOrClinic: doctor.hospitalOrClinic,
      speciality: doctor.speciality
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch doctor profile." });
  }
});

// --- Patient Profile Endpoint (Protected) ---
app.get("/patient/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await signupModel.findOne({ _id: id, role: "patient" });
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        res.json({
            patientID: patient.patientID,
            patientName: patient.patientName,
            contactInfo: patient.contactInfo,
            medicalHistory: patient.medicalHistory,
            allergies: patient.allergies,
            bloodType: patient.bloodType,
            emergencyContact: patient.emergencyContact,
            role: patient.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch patient profile." });
    }
});

// --- Paramedic Profile Endpoint (Protected) ---
app.get("paramedic/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const paramedic = await signupModel.findOne({ _id: id, role: "paramedic" });
        if (!paramedic) return res.status(404).json({ message: "Paramedic not found" });
        res.json({
            paramedicID: paramedic.paramedicID,
            paramedicName: paramedic.paramedicName,
            contactInfo: paramedic.contactInfo,
            certification: paramedic.certification,
            emergencyService: paramedic.emergencyService,
            yearsOfExperience: paramedic.yearsOfExperience,
            role: paramedic.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch paramedic profile." });
    }
});
