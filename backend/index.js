// /backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const signupModel = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api', require('./apiRoutes'));

const mongoURI = 'mongodb://localhost:27017/NFC'; 

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = 9000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post("/signup", async (req, res) => {
    try {
        const {
            role, userID, password, confirmPassword,
            patientName, accountID, age, bloodType, allergenInfo,
            emergencyContactID, emergencyContactName, emergencyContactNumber,
            drinkingHabits, smokingHabits, DNR, primaryPhysician,
            physicianID, insuranceID
        } = req.body;

        if (!["doctor", "patient", "paramedic"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        if (!userID) {
            return res.status(400).json({ message: "User ID is required." });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const existingUser = await signupModel.findOne({
            $or: [
                { docID: userID },
                { patientID: userID },
                { paramedicID: userID }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: "ID already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new signupModel({
            role,
            password: hashedPassword,
            ...(role === "doctor" && {
                docID: userID
            }),
            ...(role === "patient" && {
                patientID: userID,
                patientName,
                accountID: accountID,
                age: Number(age),
                bloodType: bloodType,
                allergenInfo: allergenInfo,
                emergencyContactID: emergencyContactID,
                emergencyContactName: emergencyContactName,
                emergencyContactNumber: emergencyContactNumber,
                drinkingHabits: drinkingHabits,
                smokingHabits: smokingHabits,
                DNR: DNR,
                primaryPhysician: primaryPhysician,
                physicianID: physicianID,
                insuranceID: insuranceID
            }),
            ...(role === "paramedic" && {
                paramedicID: userID
            })
        });

        await newUser.save();
        res.status(201).json({ message: "Signup successful", user: { userID, role } });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Signup failed. Please try again." });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { role, userID, password } = req.body;

        if (!role || !userID || !password) { return res.status(400).json({ message: "Role, User ID, and Password are required." }); }

        let user = null;
        if (role === "doctor") user = await signupModel.findOne({ docID: userID });
        else if (role === "patient") user = await signupModel.findOne({ accountID: userID });
        else if (role === "paramedic") user = await signupModel.findOne({ paramedicID: userID });
        else return res.status(400).json({ message: "Invalid role." });

        if (!user) return res.status(401).json({ message: "Invalid User ID." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Incorrect password." });

        const token = jwt.sign( { id: user._id, userID, role: user.role }, "jwt_secret_key", { expiresIn: "12h" } ); 

        res.cookie("token", token);
        res.json({ message: "Login successful", token, role: user.role });
    } 
    catch (err) 
    {
        console.error(err);
        res.status(500).json({ message: "Login failed. Please try again." });
    }
});

app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    signupModel.findOne({ email: email })
        .then((user) => {
            if (!user) return res.send({ Status: "User does not exist!!" });

            const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "10m" });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: 'nrn061005@gmail.com', pass: 'mjwv zkan vxji ahem' }
            });

            const mailOptions = {
                from: 'nrn061005@gmail.com',
                to: email,
                subject: 'Dr.PillPilot - Reset your Password',
                html: `
                    <h1>Password Reset Request</h1>
                    <p> Thank you for working with Dr.PillPilot!! </p>
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

app.post('/reset-password/:id/:token', (req, res) => {
    const { id, token } = req.params;
    const { newPassword } = req.body;

    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if(err) return res.json({Status: "Error with token!!"});
        else
        {
            bcrypt.hash(newPassword, 10)
                .then((hash) => {
                    signupModel.findByIdAndUpdate({_id: id}, {password: hash})
                        .then((u) => {if (u) res.send({Status: "Success"}); else console.error("Error updating password:", err); })
                        .catch(err => res.send({Status: err}))
                })
        }
    })
})

app.get('/patient/:id', async (req, res) => {
    try {
        //console.log(`Fetching patient with ID: ${req.params.id}`);
        const patient = await signupModel.findOne({ accountID: req.params.id });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        console.error('Error in GET /patient/:id:', err);
        res.status(500).json({ message: err.message });
    }
});


app.put('/patient/:id', async (req, res) => {
    try {
        //console.log(`Updating patient with ID: ${req.params.id}`);
        const updatedPatient = await signupModel.findOneAndUpdate(
            { accountID: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedPatient) return res.status(404).json({ message: 'Patient not found' });
        res.json(updatedPatient);
    } catch (err) {
        console.error('Error in PUT /patient/:id:', err);
        res.status(500).json({ message: err.message });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');  // Clear the JWT token cookie
    res.status(200).json({ message: "Logged out successfully" });
});
