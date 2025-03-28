import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const doctorID = localStorage.getItem('userID'); // Adjust according to your authentication flow

  useEffect(() => {
    if (doctorID) {
      axios.get(`http://localhost:9000/doctor/${doctorID}`)
        .then(res => {
          setDoctor(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching doctor profile:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [doctorID]);

  if (!doctorID) return <Navigate to="/login" />;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="doctor-profile">
      <h2>Doctor Profile</h2>
      <p><strong>ID:</strong> {doctor.docID}</p>
      <p><strong>Name:</strong> {doctor.doctorName}</p>
      <p><strong>Contact Info:</strong> {doctor.contactInfo}</p>
      <p><strong>Medical License Number:</strong> {doctor.medicalLicenseNumber}</p>
      <p><strong>Qualifications:</strong> {doctor.qualifications}</p>
      <p><strong>Hospital/Clinic:</strong> {doctor.hospitalOrClinic}</p>
      <p><strong>Speciality:</strong> {doctor.speciality}</p>
    </div>
  );
};

export default DoctorProfile;
