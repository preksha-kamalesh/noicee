import React, { Component } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "./CSS/patient.css";

export function Patient() 
{
    const { id } = useParams();
    const role = localStorage.getItem('role');

    return <PatientInfo role={role} id={id} />;
}

export class PatientInfo extends Component 
{
    constructor(props) 
    {
        super(props);
        this.state = { role: '', patientID: '', patientName: '', accountID: '', age: '', bloodType: '', allergenInfo: '',
            emergencyContactID: '', emergencyContactName: '', emergencyContactNumber: '', drinkingHabits: '',
            smokingHabits: '', DNR: '', primaryPhysician: '', physicianID: '', insuranceID: '', isEditing: false
        };
    }

    componentDidMount() 
    {
        document.body.classList.add('patientinfo-body')
        const patientID = localStorage.getItem('ID'); 
        if (patientID) 
        {
            this.setState({ patientID });
            this.fetchPatientData(patientID);
        }
    }

    componentWillUnmount() { document.body.classList.remove('patientinfo-body'); }

    fetchPatientData = async (patientID) => {
        // console.log('Fetching data for:', patientID); 
        try 
        {
            const response = await axios.get(`http://localhost:9000/patient/${patientID}`);
            this.setState({ ...response.data });
        } 
        catch (error) 
        {
            console.error('Error fetching patient data:', error.response || error);
            alert(error.response?.data?.message || "Failed to load patient data");
        }
    };


    handleSave = async () => {
        try 
        {
            const { patientID, ...patientData } = this.state;
            await axios.put(`http://localhost:9000/patient/${patientID}`, patientData);
            alert('Patient data updated successfully');
            this.setState({ isEditing: false });
        } 
        catch (error) 
        {
            console.error('Error updating patient data:', error);
            alert(error.response?.data?.message || "Failed to update patient data");
        }
    };


    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleRadioChange = (e) => { this.setState({ DNR: e.target.value }); };

    toggleEdit = () => { this.setState((prevState) => ({ isEditing: !prevState.isEditing })); };

    render() 
    {
        const { isEditing, patientName, accountID, age, bloodType, allergenInfo, emergencyContactID,
            emergencyContactName, emergencyContactNumber, drinkingHabits, smokingHabits, DNR, primaryPhysician,
            physicianID, insuranceID } = this.state;

        return (
            <div className="patient-info-container">
                <h2>ID: {localStorage.getItem('ID')}</h2>
                <form className="patient-info-form">

                    <label>Name:</label>
                    <input type="text" name="patientName" value={patientName}
                        onChange={this.handleInputChange} disabled={!isEditing} />

                    <label>Account ID:</label>
                    <input type="text" name="accountID" value={accountID}
                        onChange={this.handleInputChange} disabled={!isEditing} />

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

                    <label>Insurance ID:</label>
                    <input type="text" name="insuranceID" value={insuranceID}
                        onChange={this.handleInputChange} disabled={!isEditing}
                    />

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