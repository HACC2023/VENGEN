import React from 'react';
import { Container, Row, Spinner } from 'react-bootstrap';

const LoadingSpinner = () => (
  <Container>
    <Row className="justify-content-center mb-3">
      <Spinner animation="border" />
    </Row>
    <Row style={{ textAlign: 'center' }}>
      <p>Loading... Please wait</p>
    </Row>
  </Container>
);

export default LoadingSpinner;
