// src/passforgot.jsx
import React, { Component } from 'react';
import { Link, Navigate, useParams,  } from 'react-router-dom';
import axios from 'axios';
import "./CSS/passforgot.css"

export class ForgotPassword extends Component 
{
    constructor(props) 
    {
        super(props);
        this.state = { email: '', codeSent: false, enteredCode: '', generatedCode: '',             
            verified: false, newPassword: '', confirmPassword: '', redirect: false,};
    }

    componentDidMount() { document.body.classList.add('passforgot-body'); }

    componentWillUnmount() { document.body.classList.remove('passforgot-body'); }

    handleFormSubmit = (e) => {
        e.preventDefault();
        const { email } = this.state;
        alert("Email sent!!");
        axios.post('http://localhost:9000/forgot-password', { email })
            .then((res) => { if(res.data.Status === "Success") this.setState({redirect: true}); })
            .catch((err) => {console.log(err);} )
    };

    handleInputChange = (e) => { this.setState({ email: e.target.value }) };

    render() {
        const { email, redirect } = this.state;

        if(redirect) {return <Navigate to = "/login" />}        

        return (
            <div className="forgot-password-container">

                <div className="forgot-password-form-container">

                    <h2 id="heading">Forgot Password</h2>
                    <p>Please enter your email address to reset your password.</p>
                    <form id="forgot-password-form" onSubmit={this.handleFormSubmit}>
                        <label htmlFor="email">Email Address:</label>
                        <input type="email" id="email" name="email"
                            placeholder="Enter your email address" value={email}
                            onChange={this.handleInputChange} required />

                        <input type="submit" value="Submit" />
                    </form>
                    <div className="back-to-login">
                        <Link to="/login"> Back to Login </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export function ResetPasswordWrapper() 
{
    const { id, token } = useParams();
    return <ResetPassword id={id} token={token} />;
}

export class ResetPassword extends Component
{

    constructor(props)
    {
        super(props);
        this.state = {id: props.id || null, token: props.token || null, newPassword: '', confirmPassword: '', 
            passwordTooltip: true, redirect: false, }
    }
    componentDidMount() { document.body.classList.add('passreset-body'); }

    componentWillUnmount() { document.body.classList.remove('passreset-body'); }

    handlePasswordEntry = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value }, () => {if(name === 'newPassword') this.handlePasswordChange(value); });
    };

    handlePasswordChange = (inputPassword) => {
        if (inputPassword.length >= 8) this.setState({ passwordTooltip: false });
        else this.setState({ passwordTooltip: true });
    };

    handleFormSubmit = (e) => {
        e.preventDefault();
        const { newPassword, id, token } = this.state;
        
        if (!id || !token) { console.error("ID or token is missing."); return; }
        
        axios.post(`http://localhost:9000/reset-password/${id}/${token}`, { newPassword })
            .then((res) => {
                if(res.data.Status === "Success") 
                {
                    alert("Password has been reset. Going to Login page...!!");
                    this.setState({redirect: true});
                }
                else console.error("Error resetting password:", res.data);
            })
            .catch((err) => {console.log(err);} )
    };

    render()
    {
        const {newPassword, confirmPassword, redirect } = this.state;
        if(redirect) {return <Navigate to = "/login" />}
        return (
            <>
                <h2 id = "rheading"> Reset Password </h2>
                <form className='reset-form' onSubmit={this.handleFormSubmit}>
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password" id="password" name="newPassword"
                        placeholder="Create a password" value={newPassword}
                        onChange={this.handlePasswordEntry} required />

                    <label htmlFor="reset-confirm-password">Confirm Password:</label>
                    <input
                        type="password" id="confirm-password" name="confirmPassword"
                        placeholder="Confirm your password" value={confirmPassword}
                        onChange={this.handlePasswordEntry} required disabled={!newPassword}/>

                    <input type="submit" value="Change Password" disabled={!confirmPassword}/>
                </form>
            </>
        )
    }
}
