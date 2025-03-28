import React, { Component } from "react";
import "../components/CSS/patient.css";

class PatientInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            UserName: "",
            UserID: "",
            AccountID: "",
            Age: "",
            BloodType: "",
            AllergenInfo: "",
            EmergencyContactID: "",
            EmergencyContactName: "",
            EmergencyContactNumber: "",
            DrinkingHabits: "",
            SmokingHabits: "",
            DNR: "No", // Default value
            PrimaryPhysician: "",
            PhysicianID: "",
            InsuranceID: "",
            isEditing: false,
        };
    }

    componentDidMount() { document.body.classList.add('patientinfo-body'); }
    componentWillUnmount() { document.body.classList.remove('patientinfo-body'); }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    toggleEdit = () => {
        this.setState({ isEditing: !this.state.isEditing });
    };

    handleSave = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/medical", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(this.state),
            });
            if (response.ok) {
                console.log("Form Data Saved Successfully");
                this.setState({ isEditing: false });
            } else {
                console.error("Save Failed");
            }
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    render() {
        return (
            <div className=" container">
                <form className=" form-grid">
                    <div className=" block0">
                        <h3>Basic Information</h3>
                        {["UserName", "UserID", "AccountID", "InsuranceID"].map((key) => (
                            <div key={key} className=" input-group">
                                <label htmlFor={key} className=" input-label">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </label>
                                <input
                                    id={key}
                                    type="text"
                                    name={key}
                                    placeholder={key.replace(/([A-Z])/g, ' $1').trim()}
                                    value={this.state[key]}
                                    onChange={this.handleChange}
                                    disabled={!this.state.isEditing}
                                    className=" input-field"
                                />
                            </div>
                        ))}
                    </div>
                    <div className=" block1">
                        <h3>Emergency Details</h3>
                        {["Age", "EmergencyContactID", "EmergencyContactName", "EmergencyContactNumber"].map((key) => (
                            <div key={key} className=" input-group">
                                <label htmlFor={key} className=" input-label">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </label>
                                <input
                                    id={key}
                                    type="text"
                                    name={key}
                                    placeholder={key.replace(/([A-Z])/g, ' $1').trim()}
                                    value={this.state[key]}
                                    onChange={this.handleChange}
                                    disabled={!this.state.isEditing}
                                    className=" input-field"
                                />
                            </div>
                        ))}
                    </div>
                    <div className=" block2">
                        <h3>Medical Information</h3>
                        {["BloodType", "AllergenInfo", "DrinkingHabits", "SmokingHabits", "PrimaryPhysician", "PhysicianID"].map((key) => (
                            <div key={key} className=" input-group">
                                <label htmlFor={key} className=" input-label">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </label>
                                <input
                                    id={key}
                                    type="text"
                                    name={key}
                                    placeholder={key.replace(/([A-Z])/g, ' $1').trim()}
                                    value={this.state[key]}
                                    onChange={this.handleChange}
                                    disabled={!this.state.isEditing}
                                    className=" input-field"
                                />
                            </div>
                        ))}
                        <div className=" input-group">
                            <label className=" input-label">DNR:</label>
                            <div className=" radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="DNR"
                                        value="Yes"
                                        checked={this.state.DNR === "Yes"}
                                        onChange={this.handleChange}
                                        disabled={!this.state.isEditing}
                                    />
                                    Yes
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="DNR"
                                        value="No"
                                        checked={this.state.DNR === "No"}
                                        onChange={this.handleChange}
                                        disabled={!this.state.isEditing}
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className=" button-group">
                        {this.state.isEditing ? (
                            <button type="button" onClick={this.handleSave} className=" save-button">Save</button>
                        ) : (
                            <button type="button" onClick={this.toggleEdit} className=" edit-button">Edit</button>
                        )}
                    </div>
                </form>
            </div>
        );
    }
}

export default PatientInfo;