import React, { Component } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import bcrypt from "bcryptjs";
import "./CSS/patient.css";

// Wrapper to pass route params
export function Patient() {
    const { id } = useParams();
    const role = localStorage.getItem('role');
    return <PatientInfo role={role} id={id} />;
}

export class PatientInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Patient Info
            patientID: '',
            patientName: '',
            accountID: '',
            age: '',
            bloodType: '',
            allergenInfo: '',
            emergencyContactID: '',
            emergencyContactName: '',
            emergencyContactNumber: '',
            drinkingHabits: '',
            smokingHabits: '',
            DNR: '',
            primaryPhysician: '',
            physicianID: '',
            insuranceID: '',
            
            // UI State
            isEditing: false,
            isInsuranceVisible: false,
            hashedInsuranceID: '',
            passwordInput: '',
            showMedicalInfo: false, // To toggle between patient and doctor forms
        };
    }

    componentDidMount() {
        document.body.classList.add('patientinfo-body');
        const patientID = localStorage.getItem('ID');
        if (patientID) {
            this.setState({ patientID });
            this.fetchPatientData(patientID);
        }
    }

    componentWillUnmount() {
        document.body.classList.remove('patientinfo-body');
    }

    // Fetch Patient Data from Backend
    fetchPatientData = async (patientID) => {
        try {
            const response = await axios.get(`http://localhost:9000/patient/${patientID}`);
            this.setState({ ...response.data });

            // Hash Insurance ID after fetching
            if (response.data.insuranceID) {
                this.hashInsuranceID(response.data.insuranceID);
            }
        } catch (error) {
            console.error('Error fetching patient data:', error);
            alert(error.response?.data?.message || "Failed to load patient data");
        }
    };

    // Hash Insurance ID
    hashInsuranceID = async (insuranceID) => {
        const hashed = await bcrypt.hash(insuranceID, 10);
        this.setState({ hashedInsuranceID: hashed });
    };

    // Handle Input Changes
    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    // Handle Save for Patient Data
    handleSave = async () => {
        try {
            const { patientID, ...patientData } = this.state;
            await axios.put(`http://localhost:9000/patient/${patientID}`, patientData);
            alert('Patient data updated successfully');
            this.setState({ isEditing: false });
        } catch (error) {
            console.error('Error updating patient data:', error);
            alert(error.response?.data?.message || "Failed to update patient data");
        }
    };

    // Handle Edit Toggle
    toggleEdit = () => {
        this.setState((prevState) => ({ isEditing: !prevState.isEditing }));
    };

    // Handle Password Input Change
    handlePasswordInputChange = (e) => {
        this.setState({ passwordInput: e.target.value });
    };

    // Handle Viewing Insurance ID
    handleViewInsurance = async () => {
        const { passwordInput } = this.state;
        const storedPassword = localStorage.getItem('Pass');

        if (passwordInput && storedPassword) {
            const match = await bcrypt.compare(passwordInput, storedPassword);
            if (match) {
                this.setState({ isInsuranceVisible: true });
            } else {
                alert('Incorrect password');
            }
        } else {
            alert('Invalid password format');
        }
    };

    // Toggle to Doctor Form
    handleShowMedicalInfo = () => {
        this.setState({ showMedicalInfo: true });
    };

    render() {
        const { role } = this.props;
        const {
            patientID, patientName, accountID, age, bloodType, allergenInfo,
            emergencyContactID, emergencyContactName, emergencyContactNumber,
            drinkingHabits, smokingHabits, DNR, primaryPhysician, physicianID,
            insuranceID, hashedInsuranceID, isEditing, isInsuranceVisible,
            passwordInput, showMedicalInfo
        } = this.state;

        if (showMedicalInfo) {
            return <DoctorForm patientID={patientID} />;
        }
        return (
            <div className="patient-info-container">
               <div className="header-container">
                    <h2>Patient ID: {patientID}</h2>
                    {role === 'doctor' && (
                        <button onClick={this.handleShowMedicalInfo}>
                            Get other Medical Information
                        </button>
                    )}
                </div>
                <form className="patient-info-form">

                    <label>Name:</label>
                    <input type="text" name="patientName" value={patientName}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Account ID:</label>
                    <input type="text" name="accountID" value={accountID}
                        onChange={this.handleInputChange} disabled />

                    <label>Age:</label>
                    <input type="number" name="age" value={age}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Blood Type:</label>
                    <input type="text" name="bloodType" value={bloodType} 
                    onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Allergen Info:</label>
                    <input type="text" name="allergenInfo" value={allergenInfo}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Emergency Contact Name:</label>
                    <input type="text" name="emergencyContactName" value={emergencyContactName}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Emergency Contact ID:</label>
                    <input type="text" name="emergencyContactID" value={emergencyContactID}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Emergency Contact Number:</label>
                    <input type="text" name="emergencyContactNumber" value={emergencyContactNumber}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Drinking Habits:</label>
                    <div>
                        <label>
                            <input type="radio" name="drinkingHabits" value="Yes" checked={drinkingHabits === 'Yes'}
                                onChange={this.handleInputChange} disabled={!isEditing} /> Yes
                        </label>
                        <label>
                            <input type="radio" name="drinkingHabits" value="No" checked={drinkingHabits === 'No'}
                                onChange={this.handleInputChange} disabled={!isEditing} /> No
                        </label>
                    </div>

                    <label>Smoking Habits:</label>
                    <div>
                        <label>
                            <input type="radio" name="smokingHabits" value="Yes" checked={smokingHabits === 'Yes'}
                                onChange={this.handleInputChange} disabled={!isEditing} /> Yes
                        </label>
                        <label>
                            <input type="radio" name="smokingHabits" value="No" checked={smokingHabits === 'No'}
                                onChange={this.handleInputChange} disabled={!isEditing} /> No
                        </label>
                    </div>

                    <label>DNR (Do Not Resuscitate):</label>
                    <div>
                        <label>
                            <input type="radio" name="DNR" value="Yes" checked={DNR === 'Yes'}
                                onChange={this.handleRadioChange} disabled={!isEditing} /> Yes
                        </label>
                        <label>
                            <input type="radio" name="DNR" value="No" checked={DNR === 'No'}
                                onChange={this.handleRadioChange} disabled={!isEditing} /> No
                        </label>
                    </div>

                    <label>Primary Physician:</label>
                    <input type="text" name="primaryPhysician" value={primaryPhysician}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Physician ID:</label>
                    <input type="text" name="physicianID" value={physicianID}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Insurance ID: </label>
                    <div className="insurance-wrapper">
                        <input
                            type="text"
                            value={isInsuranceVisible ? insuranceID : hashedInsuranceID}
                            disabled
                        />
                        {!isInsuranceVisible && (
                            <>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={passwordInput}
                                    onChange={this.handlePasswordInputChange}
                                />
                                <button type="button" onClick={this.handleViewInsurance}>
                                    View
                                </button>
                            </>
                        )}
                    </div>

                    <div className="button-group">
                        {isEditing ? (
                            <button className = "edit-button" type="button" onClick={this.handleSave}>Save</button>
                        ) : (
                            <button className = "edit-button" type="button" onClick={this.toggleEdit}>Edit</button>
                        )}
                    </div>
                </form>
            </div>
        );
    }
}

// Separate Doctor Form for Medical Info (only accessible by doctors)
class DoctorForm extends Component {
    state = {
        currentMeds: '',
        currentIllness: '',
        previousSurgeries: '',
        weight: '',
        BMI: '',
        bloodSugar: '',
        BP: ''
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleSave = async () => {
        try {
            const { patientID } = this.props;
            await axios.put(`http://localhost:9000/patient/${patientID}`, this.state);
            alert('Medical data updated successfully');
        } catch (error) {
            console.error('Error updating medical data:', error);
            alert(error.response?.data?.message || "Failed to update medical data");
        }
    };

    render() {
        return (
            <div className="doctor-form">
                <h3>Medical Information</h3>
                <input type="text" name="currentMeds" placeholder="Current Medications"
                    onChange={this.handleInputChange} />

                <button type="button" onClick={this.handleSave}>
                    Save
                </button>
            </div>
        );
    }
}
