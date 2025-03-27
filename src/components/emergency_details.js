import React, { useState } from 'react';

const EmergencyPatientPage = () => {
  // Sample patient data (would typically come from props or API)
  const initialPatientData = {
    personalInfo: {
      name: "xyz",
      age: 45,
      gender: "Male",
      bloodType: "O+",
      weight: "80 kg",
      height: "175 cm"
    },
    medicalHistory: {
      allergies: ["Penicillin", "Shellfish"],
      conditions: ["Hypertension", "Type 2 Diabetes"],
      surgeries: ["Appendectomy (2010)"]
    },
    vitalSigns: {
      heartRate: 85,
      bloodPressure: "120/80",
      temperature: 98.6,
      oxygenSaturation: 98
    },
    emergencyContacts: [
      { name: "abc", relationship: "Spouse", phone: "555-0101" },
      { name: "123", relationship: "Brother", phone: "555-0202" }
    ],
    treatmentNotes: "Patient presented with chest pain and shortness of breath. Administered aspirin 325mg."
  };

  // State management
  const [patientData, setPatientData] = useState(initialPatientData);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(initialPatientData.treatmentNotes);

  // Handle form submission
  const handleSave = () => {
    setPatientData(prev => ({ ...prev, treatmentNotes: editNotes }));
    setIsEditing(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Emergency Patient Details</h1>
      
      {/* Patient Information Section */}
      <div style={styles.section}>
        <h2>Patient Information</h2>
        <div style={styles.grid}>
          {Object.entries(patientData.personalInfo).map(([key, value]) => (
            <div key={key} style={styles.infoItem}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      </div>

      {/* Medical History Section */}
      <div style={styles.section}>
        <h2>Medical History</h2>
        <div style={styles.grid}>
          <div style={styles.infoItem}>
            <strong>Allergies:</strong> {patientData.medicalHistory.allergies.join(', ')}
          </div>
          <div style={styles.infoItem}>
            <strong>Conditions:</strong> {patientData.medicalHistory.conditions.join(', ')}
          </div>
          <div style={styles.infoItem}>
            <strong>Surgeries:</strong> {patientData.medicalHistory.surgeries.join(', ')}
          </div>
        </div>
      </div>

      {/* Vital Signs Section */}
      <div style={styles.section}>
        <h2>Vital Signs</h2>
        <div style={styles.grid}>
          {Object.entries(patientData.vitalSigns).map(([key, value]) => (
            <div key={key} style={styles.infoItem}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div style={styles.section}>
        <h2>Emergency Contacts</h2>
        <div style={styles.grid}>
          {patientData.emergencyContacts.map((contact, index) => (
            <div key={index} style={styles.infoItem}>
              <div><strong>Name:</strong> {contact.name}</div>
              <div><strong>Relationship:</strong> {contact.relationship}</div>
              <div><strong>Phone:</strong> {contact.phone}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Notes Section */}
      <div style={styles.section}>
        <h2>Treatment Notes</h2>
        {isEditing ? (
          <>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.buttonGroup}>
              <button onClick={handleSave} style={styles.button}>Save</button>
              <button onClick={() => setIsEditing(false)} style={styles.button}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p style={styles.notes}>{patientData.treatmentNotes}</p>
            <button onClick={() => setIsEditing(true)} style={styles.button}>Edit Notes</button>
          </>
        )}
      </div>

      <button style={styles.printButton} onClick={() => window.print()}>Print Patient Details</button>
    </div>
  );
};

// Styling
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    color: '#cc0000',
    textAlign: 'center'
  },
  section: {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '15px'
  },
  infoItem: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  textarea: {
    width: '100%',
    height: '150px',
    margin: '10px 0',
    padding: '10px',
    fontSize: '16px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  button: {
    backgroundColor: '#cc0000',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  printButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'block',
    margin: '20px auto'
  },
  notes: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6'
  }
};

export default EmergencyPatientPage;