import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { NavLink } from 'react-router-dom';
import { Image, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowRight } from 'react-bootstrap-icons';
import { AiOutlineUser } from 'react-icons/ai';
import { BsPersonSquare } from 'react-icons/bs';

const NavBar = () => {
  // useTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker
  const { currentUser } = useTracker(() => ({
    currentUser: Meteor.user() ? Meteor.user().username : '',
  }), []);

  const userIcon = (<span> <AiOutlineUser /> </span>);

  return (
    <Navbar expand="xl" className="px-5" id="main-navbar">
      {currentUser ? ([
        <Navbar.Brand as={NavLink} to="/home" key="logo">
          <Image src="/images/logo.png" width="200px" />
        </Navbar.Brand>,
      ]) : ([
        <Navbar.Brand as={NavLink} to="/" key="logo">
          <Image src="/images/logo.png" width="200px" />
        </Navbar.Brand>,
      ])}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" color="white">
        <Nav className="me-auto justify-content-start">
          {currentUser ? ([
            <Nav.Link id="discussions" as={NavLink} to="/Discussions" key="discussions">Discussions</Nav.Link>,
            <Nav.Link id="view-gallery-nav" as={NavLink} to="/gallery" key="viewGallery">Gallery</Nav.Link>,
            <NavDropdown title="Upload" key="upload-new-nav" align="down-centered">
              <NavDropdown.Item id="add-model-nav" as={NavLink} to="/NewModel" key="addModel">New Model</NavDropdown.Item>
              <NavDropdown.Item id="add-sim-nav" as={NavLink} to="/SimGenerator" key="simGenerator">New Simulation</NavDropdown.Item>
            </NavDropdown>,
            <Nav.Link id="statistics" as={NavLink} to="/Statistics" key="statistics">Statistics</Nav.Link>,
          ]) : ''}

        </Nav>
        <Nav className="justify-content-end">
          {currentUser === '' ? (
            <NavDropdown id="login-dropdown" title={userIcon} align="end" key="User">
              <NavDropdown.Item id="login-dropdown-sign-in" as={NavLink} key="signin" to="/signin">
                Sign
                in
              </NavDropdown.Item>
              <NavDropdown.Item id="login-dropdown-sign-up" as={NavLink} key="signup" to="/signup">
                Sign
                up
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <NavDropdown id="navbar-current-user" title={currentUser} align="end" key="User">
              <NavDropdown.Item id="navbar-profile" as={NavLink} key="profile" to="/profile">
                <BsPersonSquare />
                {' '}
                My Profile
              </NavDropdown.Item>
              <NavDropdown.Item id="navbar-sign-out" as={NavLink} key="signout" to="/signout">
                <BoxArrowRight />
                {' '}
                Sign out
              </NavDropdown.Item>
            </NavDropdown>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
