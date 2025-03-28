import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const HomePage = ({ userInfo, isLoading }) => {
  const [profile, setProfile] = useState(null);
const [error, setError] = useState('');
const [debugInfo, setDebugInfo] = useState({});

// Fetch user profile based on role
useEffect(() => {
    console.log("HomePage received userInfo:", JSON.stringify(userInfo, null, 2));
    setDebugInfo(prev => ({...prev, receivedUserInfo: userInfo}));
    
    if (isLoading) {
        console.log("User data is still loading");
        return;
    }
    
    if (!userInfo) {
        console.error("userInfo is missing or null");
        setError("User information is missing. Please try logging in again.");
        setDebugInfo(prev => ({...prev, error: "Missing userInfo"}));
        return;
    }

    if (!userInfo.role) {
        console.error("userInfo.role is missing or null:", userInfo);
        setError("User role information is missing. Please try logging in again.");
        setDebugInfo(prev => ({...prev, error: "Missing role", userInfo}));
        return;
    }
    
    if (!userInfo.userId) {
        console.error("userInfo.userId is missing or null:", JSON.stringify(userInfo, null, 2));
        setError("User ID is missing. Please try logging in again.");
        setDebugInfo(prev => ({...prev, error: "Missing userId", userInfo}));
        return;
    }

    // Validate that userId is a valid MongoDB ObjectId format (24 hex chars)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userInfo.userId);
    if (!isValidObjectId) {
        console.error("userInfo.userId is not a valid MongoDB ObjectId:", userInfo.userId);
        setError("Invalid user ID format. Please try logging in again.");
        setDebugInfo(prev => ({...prev, error: "Invalid userId format", userId: userInfo.userId}));
        return;
    }
    
    const fetchProfile = async () => {
    try {
        let response;
        const role = userInfo.role.toLowerCase();
        setDebugInfo(prev => ({...prev, requestAttempt: {role, userId: userInfo.userId}}));
        
        console.log(`Attempting to fetch ${role} profile with MongoDB ID: ${userInfo.userId}`);
        
        if (role === 'doctor') {
            console.log(`Fetching doctor profile with ID: ${userInfo.userId}`);
            response = await axios.get('http://localhost:9000/doctor-profile', { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else if (role === 'patient') {
            console.log(`Fetching patient profile with MongoDB ID: ${userInfo.userId}`);
            response = await axios.get(`http://localhost:9000/api/patient/${userInfo.userId}`, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else if (role === 'paramedic') {
            console.log(`Fetching paramedic profile with MongoDB ID: ${userInfo.userId}`);
            response = await axios.get(`http://localhost:9000/api/paramedic/${userInfo.userId}`, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            throw new Error(`Unsupported user role: ${role}`);
        }
        
        if (response && response.data) {
            console.log(`Profile data received for ${role}:`, JSON.stringify(response.data, null, 2));
            setProfile(response.data);
            setDebugInfo(prev => ({...prev, profileData: response.data, responseStatus: response.status}));
        } else {
            console.warn(`No data received for ${role} profile`);
            setError(`No profile data found for ${role}. Please contact support.`);
            setDebugInfo(prev => ({...prev, error: "Empty response data", responseStatus: response?.status}));
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
        const statusCode = err.response?.status || 'No status';
        
        console.error(`Error fetching ${userInfo.role} profile:`, errorMessage);
        console.error('Error details:', err);
        
        setError(`Failed to load ${userInfo.role} profile. Error: ${errorMessage}`);
        setDebugInfo(prev => ({
            ...prev, 
            errorDetails: {
                message: errorMessage,
                status: statusCode,
                stack: err.stack
            }
        }));
    }
    };
    
    fetchProfile();
}, [userInfo]);

return (
    <div className="home-page">
    <h2>Welcome to the Home Page</h2>
    {isLoading ? (
        <p>Loading user information...</p>
    ) : userInfo.role === 'doctor' ? (
        profile ? (
        <div className="doctor-home">
            <h3>Your Doctor Details</h3>
            <p><strong>Doctor Name:</strong> {profile.doctorName}</p>
            <p><strong>Doctor ID:</strong> {profile.doctorID}</p>
            <p><strong>Contact Info:</strong> {profile.contactInfo}</p>
            <p><strong>Medical License Number:</strong> {profile.medicalLicenseNumber}</p>
            <p><strong>Qualifications:</strong> {profile.qualifications}</p>
            <p><strong>Hospital/Clinic:</strong> {profile.hospitalOrClinic}</p>
            <p><strong>Speciality:</strong> {profile.speciality}</p>
        </div>
        ) : (
        <p>Loading your doctor details...</p>
        )
    ) : userInfo.role === 'patient' ? (
        profile ? (
        <div className="patient-home">
            <h3>Your Patient Details</h3>
            <p><strong>Patient Name:</strong> {profile.patientName || "Not provided"}</p>
            <p><strong>Patient ID:</strong> {profile.patientID}</p>
            <p><strong>Contact Info:</strong> {profile.contactInfo || "Not provided"}</p>
            <p><strong>Medical History:</strong> {profile.medicalHistory || "Not provided"}</p>
            <p><strong>Allergies:</strong> {profile.allergies || "Not provided"}</p>
            <p><strong>Blood Type:</strong> {profile.bloodType || "Not provided"}</p>
            <p><strong>Emergency Contact:</strong> {profile.emergencyContact || "Not provided"}</p>
        </div>
        ) : (
        <p>Loading your patient details...</p>
        )
    ) : userInfo.role === 'paramedic' ? (
        profile ? (
        <div className="paramedic-home">
            <h3>Your Paramedic Details</h3>
            <p><strong>Paramedic Name:</strong> {profile.paramedicName || "Not provided"}</p>
            <p><strong>Paramedic ID:</strong> {profile.paramedicID}</p>
            <p><strong>Contact Info:</strong> {profile.contactInfo || "Not provided"}</p>
            <p><strong>Certification:</strong> {profile.certification || "Not provided"}</p>
            <p><strong>Emergency Service:</strong> {profile.emergencyService || "Not provided"}</p>
            <p><strong>Years of Experience:</strong> {profile.yearsOfExperience || "Not provided"}</p>
        </div>
        ) : (
        <p>Loading your paramedic details...</p>
        )
    ) : (
        <p>Welcome! Your role: {userInfo.role}</p>
    )}
    {error && <p style={{ color: 'red' }}>{error}</p>}

    {/* Debug information section (visible in development) */}
    {process.env.NODE_ENV === 'development' && (
    <div className="debug-info" style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h4>Debug Information</h4>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
        {JSON.stringify(debugInfo, null, 2)}
        </pre>
    </div>
    )}
    </div>
  );
};

export default HomePage;
