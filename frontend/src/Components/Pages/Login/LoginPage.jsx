import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./LoginPage.scss";
import logo from "../../../Assest/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hard-coded credentials
    const validEmail = "admin@admin.com";
    const validPassword = "admin";

    if (email === validEmail && password === validPassword) {
      // Login successful
      navigate("/dashboard"); // Redirect to the dashboard
    } else {
      // Login failed
      setError("Invalid email or password.");
      navigate("/dashboard"); // Redirect to the dashboard
    }
  };

  return (
    <div className="login-container screen-1">
      <div className="form">
        <img src={logo} alt="Logo" className="login-image" />
        <form onSubmit={handleSubmit}>
          <div className="input-group email">
            <i className="icon-mail" aria-hidden="true"></i>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              aria-label="Email"
            />
          </div>
          <div className="input-group password">
            <i className="icon-lock" aria-hidden="true"></i>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              aria-label="Password"
            />
          </div>

          <button type="submit" className="login">
            Login
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        <div className="footer">
          <span>Forgot Password?</span>
          <span>Sign Up</span>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckDefault"
          />
          <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
            If you are admin trun on this button
          </label>
        </div>
      </div>
    </div>
  );
};

export default Login;
