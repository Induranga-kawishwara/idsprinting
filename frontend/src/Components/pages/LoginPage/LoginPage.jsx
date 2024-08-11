import React, { useState } from "react";
import "./LoginPage.scss";
import logo from "../../../Assest/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the login logic here
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="login-container screen-1">
      <img src={logo} alt="Logo" className="login-image" />{" "}
      {/* Add your image here */}
      <form onSubmit={handleSubmit}>
        <div className="input-group email">
          <i className="icon-mail"></i> {/* Mail icon */}
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div className="input-group password">
          <i className="icon-lock"></i> {/* Lock icon */}
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" className="login">
          Login
        </button>
      </form>
      <div className="footer">
        <span>Forgot Password?</span>
        <span>Sign Up</span>
      </div>
    </div>
  );
};

export default Login;
