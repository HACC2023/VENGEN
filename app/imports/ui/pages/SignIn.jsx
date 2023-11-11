import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import { Alert, Card, CardGroup, Col, Container, Row, Modal, Form, Button } from 'react-bootstrap';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-bootstrap5';

/**
 * Signin page overrides the form’s submit event and call Meteor’s loginWithPassword().
 * Authentication errors modify the component’s state to be displayed
 */
const SignIn = () => {
  const [input2FA, setInput2FA] = useState(false);
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(false);
  const schema = new SimpleSchema({
    email: String,
    password: String,
  });
  const bridge = new SimpleSchema2Bridge(schema);

  // Handle Signin submission using Meteor's account mechanism.
  const submit = (doc) => {
    // console.log('submit', doc, redirect);
    const { email, password } = doc;
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        if (err.error === 'no-2fa-code') {
          setInput2FA(true);
        } else {
          setError(err.reason);
        }
      } else {
        setRedirect(true);
      }
    });
    // console.log('submit2', email, password, error, redirect);
  };

  const signInWith2FA = (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-form-email').value;
    const password = document.getElementById('signin-form-password').value;
    const code = document.getElementById('2fa-code').value;

    Meteor.loginWithPasswordAnd2faCode(email, password, code, (err) => {
      if (err) {
        swal('Login Unsuccessful', '2FA Code Mismatch', 'error');
      } else {
        setRedirect(true);
      }
    });
  };

  // Render the signin form.
  // console.log('render', error, redirect);
  // if correct authentication, redirect to page instead of login screen
  if (redirect) {
    return (<Navigate to="/home" />);
  }
  // Otherwise return the Login form.
  return (
    <Container id="signin-page" className="py-3 my-5">
      <Row className="justify-content-center">
        <Col xs={5}>
          <AutoForm schema={bridge} onSubmit={data => submit(data)}>
            <CardGroup style={{ border: '3px solid #f8744d', borderRadius: '10px' }}>
              <Card>
                <Card.Title className="text-center mt-5">Sign-In</Card.Title>
                <Card.Body className="p-5">
                  <TextField id="signin-form-email" name="email" placeholder="E-mail address" />
                  <TextField id="signin-form-password" name="password" placeholder="Password" type="password" />
                  <ErrorsField />
                  <SubmitField id="signin-form-primary" className="custom-submit-button" />
                  <br />
                  <hr />
                  <p className="sign-link"><Link to="/signup">Click here to Register</Link></p>
                </Card.Body>
              </Card>
            </CardGroup>
          </AutoForm>
          {error === '' ? (
            ''
          ) : (
            <Alert variant="danger">
              <Alert.Heading>Login was not successful</Alert.Heading>
              {error}
            </Alert>
          )}
        </Col>
      </Row>
      <Modal show={input2FA} onHide={() => setInput2FA(false)} centered>
        <Modal.Body>
          Input 2FA Code
          <Form>
            <Form.Control id="2fa-code" placeholder="2FA Code" />
            <Button variant="primary" type="submit" onClick={(event) => signInWith2FA(event)} alt="Submit 2FA Code">Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SignIn;
