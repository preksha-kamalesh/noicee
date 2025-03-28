import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, matchPath } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from "./components/signin";
import SignUp from "./components/signup";      
import { ForgotPassword, ResetPasswordWrapper } from "./components/passforgot";
import { isAuthenticated, logout } from "./features/auth";
import HomePage from "./components/homepage";   
import { Doctor } from "./components/DoctorProfile";
import Main from "./components/main";              
import "./App.css";

const App = () => {
const [authenticated, setAuthenticated] = useState(false);
const [loading, setLoading] = useState(true);
  // Store user information; for doctors we use docID
const [userInfo, setUserInfo] = useState({ username: '', role: '', userId: '', docID: '' });

const fetchUserData = async () => {
setLoading(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))?.split('=')[1];
      if (token) {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        // Extract the correct userId from token - prioritize MongoDB _id
        // Extract the userId from token (backend uses 'id' for MongoDB _id)
        const userId = decoded.id; // MongoDB ID from backend
        const roleSpecificId = decoded.userID || decoded.docID;
        console.log("Extracted MongoDB userId:", userId);
        console.log("Extracted role-specific ID:", roleSpecificId);

        const userInfoObj = {
            username: decoded.username || decoded.name || '',
            role: decoded.role || '',
            userId: userId, // MongoDB _id for API calls
            docID: decoded.role === 'doctor' ? roleSpecificId : ''
        };
        console.log("This userId will be used for API calls:", userInfoObj.userId);
        setUserInfo(userInfoObj);
        setAuthenticated(true);
        setLoading(false);
      }
    } catch (error) {
    console.error("Error fetching user data:", error);
    console.error("JWT decode failed - token may be invalid");
    setUserInfo({ username: '', role: '', userId: '', docID: '' });
    setAuthenticated(false);
    setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
    setLoading(true);
      const authStatus = await isAuthenticated();
      setAuthenticated(authStatus);
    if (authStatus) {
    await fetchUserData();
    } else {
    setLoading(false);
    }
};
checkAuth();
  }, []);

  const handleLogout = async () => {
    const loggedOut = await logout();
    if (loggedOut) {
      setAuthenticated(false);
    setUserInfo({ username: '', role: '', userId: '', docID: '' });
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      alert("Thank you for visiting NFC tag...");
    } else {
      alert('Logout failed. Please try again.');
    }
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    fetchUserData();
  };

  return (
    <Router>
      <div>
        <Navigation authenticated={authenticated} handleLogout={handleLogout} userInfo={userInfo} />
        <Routes>
          <Route path="/" element={<Main />} />
          {/* For doctors, redirect to /home/:id */}
        <Route 
        path="/home" 
        element={
            authenticated ? 
            (
                <HomePage 
                userInfo={userInfo} 
                isLoading={loading} 
                />
            ) : 
            <Navigate to="/login" />
        } 
        />
          <Route 
            path="/doctor-profile/:id" 
            element={
              authenticated && userInfo.role === 'doctor' ? 
              <Doctor /> : 
              <Navigate to={authenticated ? "/home" : "/login"} />
            } 
          />
          <Route 
            path="/login" 
            element={authenticated ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPasswordWrapper />} />
          <Route path="*" element={<Navigate to={authenticated ? "/home" : "/"} />} />
        </Routes>
      </div>
    </Router>
  );
};

const Navigation = ({ authenticated, handleLogout, userInfo }) => {
  const location = useLocation();
  const hiddenRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password/:id/:token'];
  const isHiddenRoute = hiddenRoutes.some(route =>
    matchPath({ path: route, end: true }, location.pathname)
  );
  return (
    <nav className="navStyle">
      {!isHiddenRoute && authenticated && (
        <>
          <Link to="/home" className="nav-link">
            <button className="nav-button button-hover">
              <img src="navbar_home.png" alt="Home" className="nav-icon" />
              <span className="button-text">Home</span>
            </button>
          </Link>
          {userInfo.role === 'doctor' && (
            <Link to={`/doctor-profile/${userInfo.docID || userInfo.userId}`} className="nav-link">
              <button className="nav-button button-hover">
                <img src="navbar_profile.png" alt="Profile" className="nav-icon" />
                <span className="button-text">Profile</span>
              </button>
            </Link>
          )}
          <Link to="/" onClick={handleLogout} className="nav-link">
            <button className="nav-button button-hover">
              <img src="navbar_logout.png" alt="Logout" className="nav-icon" />
              <span className="button-text">Logout</span>
            </button>
          </Link>
          <div className="user-info">
            <span className="username">{userInfo.username}</span>
            <span className="role-badge">{userInfo.role}</span>
          </div>
        </>
      )}
    </nav>
  );
};

export default App;
