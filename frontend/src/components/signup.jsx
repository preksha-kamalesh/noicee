import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import './CSS/signup.css';

class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            role: '', userID: '', password: '', confirmPassword: '',
            patientName: '', accountID: "", age: "", bloodType: "", allergenInfo: "", emergencyContactID: "", emergencyContactName: "",
            emergencyContactNumber: "", drinkingHabits: "", smokingHabits: "", DNR: "", primaryPhysician: "", physicianID: "", insuranceID: "",
            passwordTooltip: true, redirect: false, goToMain: false
        };

        this.passwordRegex = /^[A-Za-z0-9_@]{8,}$/;
    }

    componentDidMount() { document.body.classList.add('signup-body'); }
    componentWillUnmount() { document.body.classList.remove('signup-body'); }

    handleFormSubmission = async (e) => {
        e.preventDefault();
        const { password, confirmPassword, userID } = this.state;

        console.log(userID, "logged in");   
        if (!this.passwordRegex.test(password)) {
            alert("Password must be at least 8 characters long and contain letters, numbers, underscores, or '@'.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match! Try again.");
            return;
        }

        const userData = { ...this.state };

        try {
            await axios.post('http://localhost:9000/signup', userData);
            alert('Sign up successful!');
            this.setState({ redirect: true });
        } catch (err) {
            alert(err.response?.data?.message || "Signup failed! Try again.");
        }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value }, () => {
            if (name === 'password') this.handlePasswordChange(value);
        });
    };

    handleRadioChange = (e) => {
        this.setState({ DNR: e.target.value });
    };

    handleRoleSelection = (role) => {
        this.setState({ role });
    };

    handlePasswordChange = (inputPassword) => {
        this.setState({ passwordTooltip: inputPassword.length < 8 });
    };

    handleGoBack = () => {
        this.setState({ goToMain: true });
    };

    render() {
        const { userID, password, confirmPassword, role, passwordTooltip, redirect, goToMain, patientName, accountID, age, bloodType, allergenInfo, emergencyContactID, emergencyContactName,
            emergencyContactNumber, drinkingHabits, smokingHabits, DNR, primaryPhysician, physicianID, insuranceID } = this.state;

        if (redirect) return <Navigate to="/login" />;
        if (goToMain) return <Navigate to="/" />;

        return (
            <div id="signuponly">
                <div className="sign-up-container">
                    <h2>Sign Up</h2>
                    <p>Create an account to get started.</p>

                    {!role ? (
                        <div className="role-selection">
                            <button type="button" onClick={() => this.handleRoleSelection('patient')}>Patient</button>
                            <button type="button" onClick={() => this.handleRoleSelection('doctor')}>Doctor</button>
                            <button type="button" onClick={() => this.handleRoleSelection('paramedic')}>Paramedic</button>
                        </div>
                    ) : (
                        <form id="sign-up-form" onSubmit={this.handleFormSubmission}>
                            <label htmlFor="role">You are:</label>
                            <input type="text" id="role" name="role"
                                value={role.charAt(0).toUpperCase() + role.slice(1)} disabled />

                            <label htmlFor="user-id">
                                {role === 'doctor' ? 'Doctor ID' : role === 'paramedic' ? 'Paramedic ID' : 'Patient ID'}:
                            </label>
                            <input type="text" id="user-id" name="userID" placeholder="Enter your ID" value={userID}
                                onChange={this.handleInputChange} required />

                            <label htmlFor="password">Password:</label>
                            <div className="input-with-tooltip">
                                <input type="password" id="password" name="password" placeholder="Create a password"
                                    value={password} onChange={this.handleInputChange} required />
                                {passwordTooltip && <span className="tooltip">Must be at least 8 characters.</span>}
                            </div>

                            <label htmlFor="confirm-password">Confirm Password:</label>
                            <input type="password" id="confirm-password" name="confirmPassword" placeholder="Confirm your password"
                                value={confirmPassword} onChange={this.handleInputChange} required />
                                
                            {role === 'patient' && (
                                <>
                                    <label>Patient Name:</label>
                                    <input type="text" name="patientName" value={patientName} onChange={this.handleInputChange} required />

                                    <label>Account ID:</label>
                                    <input type="text" name="accountID" value={accountID} onChange={this.handleInputChange} required />

                                    <label>Age:</label>
                                    <input type="number" name="age" value={age} onChange={this.handleInputChange} required />

                                    <label>Blood Type:</label>
                                    <input type="text" name="bloodType" value={bloodType} onChange={this.handleInputChange} required />

                                    <label>Allergen Info:</label>
                                    <input type="text" name="allergenInfo" value={allergenInfo} onChange={this.handleInputChange} />

                                    <label>DNR (Do Not Resuscitate):</label>
                                    <div className="radio-group">
                                        <label>
                                            <input type="radio" name="DNR" value="Yes" checked={DNR === 'Yes'} onChange={this.handleRadioChange} /> Yes
                                        </label>
                                        <label>
                                            <input type="radio" name="DNR" value="No" checked={DNR === 'No'} onChange={this.handleRadioChange} /> No
                                        </label>
                                    </div>

                                    <label>Drinking Habits:</label>
                                    <div className="radio-group">
                                        <label>
                                            <input type="radio" name="drinkingHabits" value="Yes"
                                                checked={drinkingHabits === 'Yes'} onChange={this.handleInputChange} />
                                            Yes
                                        </label>
                                        <label>
                                            <input type="radio" name="drinkingHabits" value="No"
                                                checked={drinkingHabits === 'No'} onChange={this.handleInputChange} />
                                            No
                                        </label>
                                     </div>

                                    <label>Smoking Habits:</label>
                                    <div className="radio-group">
                                        <label>
                                            <input type="radio" name="smokingHabits" value="Yes"
                                                checked={smokingHabits === 'Yes'} onChange={this.handleInputChange} />
                                            Yes
                                        </label>
                                        <label>
                                            <input type="radio" name="smokingHabits" value="No"
                                                checked={smokingHabits === 'No'} onChange={this.handleInputChange} />
                                            No
                                        </label>
                                    </div>

                                    <label>Insurance ID:</label>
                                    <input type="text" name="insuranceID" value={insuranceID} onChange={this.handleInputChange} required />

                                    <label>Emergency Contact Name:</label>
                                    <input type="text" name="emergencyContactName" value={emergencyContactName} onChange={this.handleInputChange} required />

                                    <label>Emergency Contact Number:</label>
                                    <input type="text" name="emergencyContactNumber" value={emergencyContactNumber} onChange={this.handleInputChange} required />

                                    <label>Emergency Contact ID:</label>
                                    <input type="text" name="emergencyContactID" value={emergencyContactID} onChange={this.handleInputChange} required />

                                    <label>Primary Physician:</label>
                                    <input type="text" name="primaryPhysician" value={primaryPhysician} onChange={this.handleInputChange} required />

                                    <label>Physician ID:</label>
                                    <input type="text" name="physicianID" value={physicianID} onChange={this.handleInputChange} required />
                                </>
                            )}

                            <input type="submit" value="Sign Up" />
                        </form>
                    )}

                    <div className="back-to-login">
                        <p>Already have an account? <Link to="/login">Sign-In</Link></p>
                    </div>

                    <div className="remember-me">
                        <button id="remember-me" onClick={this.handleGoBack}>
                            <b>Go back to Main Page</b>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SignUp;
