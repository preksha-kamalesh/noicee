import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import './CSS/signin.css';

class Login extends Component 
{
    constructor(props) 
    {
        super(props);
        this.state = { role: '', userID: '', password: '', redirect: false, goToMain: false, error: '', };
    }

    componentDidMount() { document.body.classList.add('signin-body'); }
    componentWillUnmount() { document.body.classList.remove('signin-body'); }

    handleFormSubmission = async (e) => {
        e.preventDefault();
        const { role, userID, password } = this.state;
    
        try 
        {
            const response = await axios.post('http://localhost:9000/login', { role, userID, password }, { withCredentials: true });
            if (response.data.token) 
            {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", role);
                localStorage.setItem("ID", userID);
    
                alert('Sign In successful!');
                this.props.onLoginSuccess();
                this.setState({ redirect: true });
            }
        } catch (err) { this.setState({ error: err.response?.data?.message || "Login failed! Try again." }); }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value, error: '' });
    };

    handleRoleSelection = (role) => { this.setState({ role, userID: '', password: '', error: '' }); };

    handleGoBack = () => { this.setState({ goToMain: true }); };

    render() 
    {
        const { role, userID, password, redirect, goToMain, error } = this.state;

        if (redirect) 
        {
            var r = localStorage.getItem('role');
            var p = localStorage.getItem('ID');
            if (r && p) return <Navigate to={`/${r}/${p}`} />;
        }
        if (goToMain) return <Navigate to="/" />;

        let imageSrc = "signin_img.webp";
        if (role === "doctor") imageSrc = "doc_signin_img.jpg";
        else if (role === "paramedic") imageSrc = "para_signin_img.jpg";
        else if (role === "patient") imageSrc = "pat_signin_img.jpg";

        return (
            <div className="login-container">
                <div className="login-form-container">
                    <h2>Login</h2>
                    <p>Enter credentials to access your account.</p>

                    {!role ? (
                        <div className="role-selection">
                            <button type="button" onClick={() => this.handleRoleSelection('patient')}>Patient</button>
                            <button type="button" onClick={() => this.handleRoleSelection('doctor')}>Doctor</button>
                            <button type="button" onClick={() => this.handleRoleSelection('paramedic')}>Paramedic</button>
                        </div>
                    ) : (
                        <form id="login-form" onSubmit={this.handleFormSubmission}>
                            {/*<label htmlFor="role">You are:</label>
                            <input type="text" id="role" value={role.charAt(0).toUpperCase() + role.slice(1)} disabled />*/ }

                            <label htmlFor="userID">
                                {role === 'doctor' ? 'Doctor ID' : role === 'patient' ? 'Patient ID' : 'Paramedic ID'}:
                            </label>
                            <input type="text" id="userID" name="userID" placeholder={`Enter your ${role} ID`}
                                value={userID} onChange={this.handleInputChange} required />

                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" name="password" placeholder="Enter your password"
                                value={password} onChange={this.handleInputChange} required disabled = {!userID}/>

                            {error && <p className="error-message">{error}</p>}
                            <input type="submit" value="Login" />
                        </form>
                    )}

                    <div className="container">
                        <Link to="/forgot-password" className="forgot-password">Forgot your password?</Link>
                    </div>

                    <div className="alternative-login">
                        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
                    </div>

                    <div className="remember-me">
                        <button id="remember-me" onClick={this.handleGoBack}>
                            <b>Go back to Main Page</b>
                        </button>
                    </div>
                </div>

                <div className="image-container">
                    <img src={imageSrc} alt="Login illustration" />
                </div>
            </div>
        );
    }
}

export default Login;
