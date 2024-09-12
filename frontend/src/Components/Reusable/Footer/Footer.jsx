import React, { useState } from "react";
import "./Footer.scss";
import Calculator from "../Calculator/Calculator";
import { LuCalculator } from "react-icons/lu";

const Footer = () => {
  const [showCalculator, setShowCalculator] = useState(false);

  const handleClick = () => {
    setShowCalculator(!showCalculator);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <button onClick={handleClick}>
          <LuCalculator />
        </button>

        {showCalculator && <Calculator onClose={handleClick} />}

        <p>© 2024 Your Company. All rights reserved.</p>

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
