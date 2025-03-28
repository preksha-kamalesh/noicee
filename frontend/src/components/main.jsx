import React, { Component } from "react";
import { Link } from "react-router-dom";

class Main extends Component
{
    render()
    {
        return (
            <div className="nav">
                <Link to="/signup"><button className="sign-up">Sign up</button></Link>
                <Link to="/login"><button className="login">Login</button></Link>
            </div>
        )
    }
}

export default Main;