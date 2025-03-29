import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import './CSS/DoctorProfile.css';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const doctorID = localStorage.getItem('userID'); // Adjust according to your authentication flow
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setError('');

    axios.get(`http://localhost:9000/patients?search=${searchQuery}`)
      .then(res => {
        setPatients(res.data);
        setSearchLoading(false);
      })
      .catch(err => {
        console.error("Error searching patients:", err);
        setError('Error fetching patient data');
        setSearchLoading(false);
      });
  };

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

      <hr />

      <h3>Search Patients</h3>
      <input
        type="text"
        placeholder="Enter Patient Name or ID"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {searchLoading && <p>Searching...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {patients.length > 0 && (
        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Contact</th>
              <th>Medical Condition</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient._id}>
                <td>{patient._id}</td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.contact}</td>
                <td>{patient.medicalCondition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {patients.length === 0 && searchQuery && !searchLoading && <p>No patients found.</p>}
    </div>
  );
};

export default DoctorProfile;
