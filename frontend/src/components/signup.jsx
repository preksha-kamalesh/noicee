import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import './CSS/signup.css';

class SignUp extends Component 
{
    constructor(props) 
    {
        super(props);
        this.state = {
            role: '', userID: '', password: '', confirmPassword: '',
            passwordTooltip: true, redirect: false, goToMain: false
        };

        this.passwordRegex = /^[A-Za-z0-9_@]{8,}$/; 
    }

    componentDidMount() { document.body.classList.add('signup-body'); }
    componentWillUnmount() { document.body.classList.remove('signup-body'); }

    handleFormSubmission = async (e) => {
        e.preventDefault();
        const { password, confirmPassword, userID, role } = this.state;


        if (!this.passwordRegex.test(password)) 
        {
            alert("Password must be at least 8 characters long and contain letters, numbers, underscores, or '@'.");
            return;
        }

        if (password !== confirmPassword) 
        {
            alert("Passwords do not match! Try again.");
            return;
        }
    
        const userData = { role, userID, password, confirmPassword };
    
        try 
        {
            await axios.post('http://localhost:9000/signup', userData);
            alert('Sign up successful!');
            this.setState({ redirect: true });
        } catch (err) { alert(err.response?.data?.message || "Signup failed! Try again."); }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value }, () => { if (name === 'password') this.handlePasswordChange(value); });
    };

    handleRoleSelection = (role) => { this.setState({ role }); };

    handlePasswordChange = (inputPassword) => { this.setState({ passwordTooltip: inputPassword.length < 8 }); };

    handleGoBack = () => { this.setState({ goToMain: true }); };

    render() 
    {
        const { userID, password, confirmPassword, role, passwordTooltip, redirect, goToMain } = this.state;

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
                                    value={password} onChange={this.handleInputChange} required disabled = {!userID} />
                                {passwordTooltip && <span className="tooltip">Must be at least 8 characters.</span>}
                            </div>

                            <label htmlFor="confirm-password">Confirm Password:</label>
                            <input type="password" id="confirm-password" name="confirmPassword" placeholder="Confirm your password" 
                                value={confirmPassword} onChange={this.handleInputChange} required disabled = {!password}/>

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
