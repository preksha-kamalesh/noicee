import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth";
import axios from "axios";
import "./CSS/ProfilePage.css";

function ProfilePage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Fields for editing
    const [fullName, setFullName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [role, setRole] = useState(""); // Added role tracking

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in! Redirecting to login...");
            navigate("/login");
            return;
        }

        // Fetch user data
        axios
            .get("http://localhost:9000/api/account", {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setUserData(response.data);
                setFullName(response.data.fullName || "");
                setAge(response.data.age || "");
                setGender(response.data.gender || "");
                setRole(response.data.role);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching profile data:", error.response?.data?.message || error.message);
                alert("Failed to load profile. Redirecting to login...");
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate]);

    useEffect(() => {
        document.body.classList.add("profilepage-body");
        return () => {
            document.body.classList.remove("profilepage-body");
        };
    }, []);

    // Handle profile update
    const handleSave = () => {
        if (role !== "patient") {
            alert("Only patients can update their profile.");
            return;
        }

        const updatedData = { fullName, age, gender };
        axios
            .put("http://localhost:9000/api/account", updatedData, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then(() => {
                alert("Profile updated successfully!");
                setUserData((prevData) => ({ ...prevData, ...updatedData }));
                setIsEditing(false);
            })
            .catch((error) => {
                console.error("Error updating profile:", error.response?.data?.message || error.message);
                alert("Failed to update profile. Please try again.");
            });
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem("token");
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            navigate("/login");
        } catch (err) {
            alert("Logout failed. Please try again.");
        }
    };

    // Handle account deletion
    const toDelete = () => {
        const isConfirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (!isConfirmed) return;

        axios
            .delete("http://localhost:9000/api/account", {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then(() => {
                alert("Account deleted successfully.");
                localStorage.removeItem("token");
                navigate("/");
                handleLogout();
                window.location.reload();
            })
            .catch((err) => {
                console.error(err.response?.data?.message || "Error deleting account");
                alert(err.response?.data?.message || "Error deleting account");
            });
    };

    if (loading) return <div className="loading">Loading your profile...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>Your Profile</h1>
                {!isEditing ? (
                    <div className="profile-info">
                        <p> <strong>Full Name:</strong> {userData.fullName} </p>
                        <p> <strong>Email:</strong> {userData.email} </p>
                        <p> <strong>Username:</strong> {userData.username} </p>
                        <p> <strong>Role:</strong> {userData.role.toUpperCase()} </p>
                        <p> <strong>Gender:</strong> {userData.gender || "Not specified"} </p>
                        <p> <strong>Age:</strong> {userData.age || "Not specified"} </p>

                        {role === "patient" && <button onClick={() => setIsEditing(true)} className="edit-button"> Edit Profile </button>}
                        <button onClick={toDelete} className="edit-button"> Delete account </button>
                        <button onClick={handleLogout} className="logout-button"> Logout </button>
                    </div>
                ) : (
                    <div className="edit-profile">
                        <label>
                            Full Name:
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </label>
                        <label>
                            Email:
                            <input type="email" value={userData.email} disabled />
                        </label>
                        <label>
                            Username:
                            <input type="text" value={userData.username} disabled />
                        </label>
                        <label>
                            Gender:
                            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                <option value="" disabled>Not specified</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        <label>
                            Age:
                            <input type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} />
                        </label>
                        <button onClick={handleSave} className="save-button"> Save </button>
                        <button onClick={() => setIsEditing(false)} className="cancel-button"> Cancel </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
