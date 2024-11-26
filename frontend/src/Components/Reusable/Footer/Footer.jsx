import React, { useState } from "react";
import "./Footer.scss";
import Calculator from "../Calculator/Calculator";
import { LuCalculator } from "react-icons/lu";
import CalculateIcon from "@mui/icons-material/Calculate";

const Footer = () => {
  const [showCalculator, setShowCalculator] = useState(false);

  const handleClick = () => {
    setShowCalculator(!showCalculator);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div
          className="calculater-icon"
          onClick={handleClick}
          style={{ cursor: "pointer" }} // Add cursor style for clarity
        >
          <CalculateIcon />
        </div>

        {showCalculator && <Calculator onClose={handleClick} />}

        <p className="footer-copiright">
          © 2024 Your Company. All rights reserved.
        </p>

        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <br />
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
