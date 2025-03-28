import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
export function Doctor() 
{
    const { id } = useParams();
    const role = localStorage.getItem('role');

    return <DoctorProfile role={role} id={id} />;
}

export const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async (docID) => {
      try {
        console.log(docID);
        const response = await axios.get(`http://localhost:9000/doctor/${docID}`, { withCredentials: true });
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load profile.');
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  if (error) return <div>{error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div className="doctor-profile">
      <h2>Doctor Profile</h2>
      <p><strong>Doctor Name:</strong> {profile.doctorName}</p>
      <p><strong>Doctor ID:</strong> {profile.doctorID}</p>
      <p><strong>Contact Info:</strong> {profile.contactInfo}</p>
      <p><strong>Medical License Number:</strong> {profile.medicalLicenseNumber}</p>
      <p><strong>Qualifications:</strong> {profile.qualifications}</p>
      <p><strong>Hospital / Clinic Associated with:</strong> {profile.hospitalOrClinic}</p>
      <p><strong>Speciality:</strong> {profile.speciality}</p>
    </div>
  );
};

