import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Link, Navigate } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';
import { Alert, Card, CardGroup, Col, Container, Row } from 'react-bootstrap';
import SimpleSchema from 'simpl-schema';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { AutoForm, ErrorsField, SubmitField, TextField } from 'uniforms-bootstrap5';
import { Users } from '../../api/user/User';

/**
 * SignUp component is similar to signin component, but we create a new user instead.
 */
const SignUp = ({ location }) => {
  const [error, setError] = useState('');
  const [redirectToReferer, setRedirectToRef] = useState(false);

  const schema = new SimpleSchema({
    email: String,
    username: String,
    password: String,
  });
  const bridge = new SimpleSchema2Bridge(schema);

  /* Handle SignUp submission. Create user account and a profile entry, then redirect to the home page. */
  const submit = (doc) => {
    const { email, username, password } = doc;
    Accounts.createUser({ email, username, password }, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        setError('');
        const userID = Meteor.users.findOne({ username: username })._id;
        Users.collection.insert({ _id: userID, username, email }, () => {
          setRedirectToRef(true);
        });
      }
    });
  };

  /* Display the signup form. Redirect to add page after successful registration and login. */
  const { from } = location?.state || { from: { pathname: '/home' } };
  // if correct authentication, redirect to from: page instead of signup screen
  if (redirectToReferer) {
    return <Navigate to={from} />;
  }
  return (
    <Container id="signup-page" className="py-md-3 my-md-5">
      <Row className="justify-content-center">
        <Col lg={5}>
          <AutoForm schema={bridge} onSubmit={data => submit(data)}>
            <CardGroup style={{ border: '3px solid #f8744d', borderRadius: '10px' }}>
              <Card>
                <Card.Title className="text-center mt-5">Sign-Up</Card.Title>
                <Card.Body className="p-md-5">
                  <TextField name="email" placeholder="E-mail address" />
                  <TextField name="username" placeholder="Username" />
                  <TextField name="password" placeholder="Password" type="password" />
                  <ErrorsField />
                  <SubmitField className="custom-submit-button" />
                  <br />
                  <hr />
                  <p className="sign-link">Already have an account? Login <Link to="/signin">here</Link></p>
                </Card.Body>
              </Card>
            </CardGroup>
          </AutoForm>
          {error === '' ? (
            ''
          ) : (
            <Alert variant="danger">
              <Alert.Heading>Registration was not successful</Alert.Heading>
              {error}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

/* Ensure that the React Router location object is available in case we need to redirect. */
SignUp.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.string,
  }),
};

SignUp.defaultProps = {
  location: { state: '' },
};

export default SignUp;
