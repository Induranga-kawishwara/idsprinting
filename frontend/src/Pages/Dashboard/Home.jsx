// src/Pages/Dashboard/Home.jsx
import React from "react";
import NavBar from "../../Components/NavBar";
// Assuming Dashboard component is defined in this file itself or another component

const Home = () => {
  return (
    <div>
      <NavBar />
      {/* Add Dashboard component or code here */}
      <div className="dashboard">
        <br />
        <br />
        <br />
        <br />
        <br />
        <h2>Welcome to IDS Printing House</h2>
        <div className="modules">{/* Add module items here */}</div>
      </div>
    </div>
  );
};

export default Home;
