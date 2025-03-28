import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, matchPath } from 'react-router-dom';
import axios from 'axios';
import Login from "./components/signin";
import SignUp from './components/signup';
import { ForgotPassword, ResetPasswordWrapper } from './components/passforgot';
import { isAuthenticated, logout } from './features/auth';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/home';
import Main from "./components/main";
import "./App.css"

class App extends Component 
{
    state = { authenticated: false, username: null, };

    fetchUsername = async () => {
        try 
        {
            const response = await axios.get("http://localhost:9000/api/account", { withCredentials: true, });
            this.setState({ user: response.data.username }); 
        } catch (error) { console.error("Error fetching user data:", error.response || error.message); }
    }

    async componentDidMount() {
        const authStatus = await isAuthenticated();
        this.setState({ authenticated: authStatus });
        if(authStatus) this.fetchUsername();
    }

    handleLogout = async () => {
        const loggedOut = await logout();
        if (loggedOut) 
        {
            this.setState({ authenticated: false, username: null });
            window.localStorage.removeItem("isLoggedIn");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            alert("Thank you for visiting NFC tag...");
        } else { alert('Logout failed. Please try again.'); }
    };

    handleLoginSuccess = () => { this.setState({ authenticated: true }); this.fetchUsername(); };

    render() 
    {
        return (
            <Router>
                <div>
                    <Navigation
                        authenticated={this.state.authenticated}
                        handleLogout={this.handleLogout}
                        username={this.state.user}
                    />
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="/home" element={this.state.authenticated ? <HomePage /> : <Navigate to="/login" />} />
                        <Route path="/account" element={this.state.authenticated ? <ProfilePage /> : <Navigate to="/login" />} />
                        <Route path="/login" element={this.state.authenticated ? <Navigate to="/home" /> : <Login onLoginSuccess={this.handleLoginSuccess} />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:id/:token" element={<ResetPasswordWrapper />} />
                    </Routes>
                </div>
            </Router>
        );
    }
}

const Navigation = ({ authenticated, handleLogout, username }) => {
    const location = useLocation();
    const hiddenRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password/:id/:token'];

    const isHiddenRoute = hiddenRoutes.some((route) => 
        matchPath({ path: route, exact: true }, location.pathname)
    );

    return (
        <nav className="navStyle">
            {!isHiddenRoute && (
                <>
                    <Link to="/home" className="nav-link">
                        <button className="nav-button button-hover">
                            <img src="navbar_home.png" alt="Home" className="nav-icon" />
                            <span className="button-text">Home</span>
                        </button>
                    </Link>

                    <Link to="/account" className="nav-link">
                        <button className="nav-button button-hover">
                            <img src="navbar_account.png" alt="Account" className="nav-icon" />
                            <span className="button-text"> {username || "Account"} </span>
                        </button>
                    </Link>

                    <Link to="/" onClick={handleLogout} className="nav-link">
                        <button className="nav-button button-hover">
                            <img src="navbar_logout.png" alt="Logout" className="nav-icon" />
                            <span className="button-text">Logout</span>
                        </button>
                    </Link>
                </>
            )}
        </nav>
    );
};

export default App;