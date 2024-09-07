import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link as RouterLink } from "react-router-dom";
import classes from "./SecondNavbar.module.css";
import {
  FcManager,
  FcBusinessContact,
  FcPlus,
} from "react-icons/fc";

const SecondaryNavbar = () => {
  return (
    <Navbar
      expand="lg"
      className={classes.secondaryNavbar}
    >
      <Navbar.Toggle aria-controls="secondary-navbar" />
      <Navbar.Collapse id="secondary-navbar">
        <Nav className={`${classes.nav__linkgroup} `}>


          <Nav.Link className={`${classes.nav__link} me-4`}>
            <RouterLink to="/settings">
              <FcBusinessContact className={classes.iconSize} />
              Add Employee
            </RouterLink>
          </Nav.Link>

          <Nav.Link className={`${classes.nav__link} me-4`}>
            <RouterLink to="#">
              <FcPlus className={classes.iconSize} />
              Add Other
            </RouterLink>
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default SecondaryNavbar;
