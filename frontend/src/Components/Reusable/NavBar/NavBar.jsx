import React, { useState } from "react";
import { Navbar, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link as RouterLink } from "react-router-dom";
import {
  FcBusinessman,
  FcInTransit,
  FcList,
  FcAddDatabase,
  FcSalesPerformance,
  FcBearish,
  FcSettings,
  FcElectricity,
  FcFolder,
  FcBiotech,
} from "react-icons/fc";
import { FiAlignJustify } from "react-icons/fi";
import classes from "./TheNavbar.module.css"; // Import the CSS module
import Logo from "../../../Assest/logo.png";

const TheNavbar = () => {
  const [expanded, setExpanded] = useState(false); // State to control the navbar's collapse

  const isLoggedIn = false; // Replace this with your actual login state

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logged out");
  };

  // Function to handle toggle of the navbar
  const handleToggle = () => setExpanded(!expanded);

  // Function to close the navbar
  const closeNavbar = () => setExpanded(false);

  return (
    <>
      <Navbar
        expand="xl"
        expanded={expanded} // Control the collapse state with expanded
        className={`${classes.navbar} fixed-top`}
        data-aos="fade-down"
        data-aos-easing="ease-out"
        data-aos-duration="2000"
      >
        <Navbar.Brand className={`ms-3 ${classes.navbar_brand}`}>
          <RouterLink to="/dashboard" onClick={closeNavbar}>
            <img
              src={Logo}
              alt="My logo"
              style={{ width: "100px", height: "auto" }}
            />
          </RouterLink>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className={classes.toggle}
          onClick={handleToggle}
        >
          <FiAlignJustify className={classes.navbartogglericon} />
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={`${classes.nav__linkgroup} ms-auto`}>
            <Nav.Link
              className={`${classes.nav__link} ${classes.firstnav__link} me-4`}
              onClick={closeNavbar} // Close the navbar on click
            >
              <RouterLink to="/sales">
                <FcFolder className={classes.iconSize} />
                Sales
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} ${classes.firstnav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/customer">
                <FcBusinessman className={classes.iconSize} /> Customer
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/additem">
                <FcAddDatabase className={classes.iconSize} />
                Add Item
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/category">
                <FcSalesPerformance className={classes.iconSize} />
                Stock Category
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/supplier">
                <FcInTransit className={classes.iconSize} />
                Supplier
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/Quatation">
                <FcList className={classes.iconSize} />
                Quatation
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/expenses">
                <FcElectricity className={classes.iconSize} />
                Expenses
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/cashups">
                <FcBearish className={classes.iconSize} />
                Cashups
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/reports">
                <FcBiotech className={classes.iconSize} />
                Reports
              </RouterLink>
            </Nav.Link>

            <Nav.Link
              className={`${classes.nav__link} me-4`}
              onClick={closeNavbar}
            >
              <RouterLink to="/settings">
                <FcSettings className={classes.iconSize} />
                Settings
              </RouterLink>
            </Nav.Link>

            {/* New Login/Logout Button */}
            <Nav.Link
              className={`${classes.nav__link} ${classes.login__link}`}
              onClick={closeNavbar}
            >
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className={classes.login__button}
                >
                  LogOut
                </button>
              ) : (
                <RouterLink to="/">
                  <button className={classes.login__button}>LogOut</button>
                </RouterLink>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default TheNavbar;
