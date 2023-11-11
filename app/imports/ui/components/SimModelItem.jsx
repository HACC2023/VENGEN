import React from 'react';
import { Card, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

/** Renders a single row in the List Stuff table. See pages/ListStuff.jsx. */
const SimModelItem = ({ model }) => (
  <Col className="mb-5">
    <Card>
      <Card.Img variant="top" src={model.base64} />
      <Card.Body className="py-1">
        <Card.Title>{model.name}</Card.Title>
      </Card.Body>
    </Card>
  </Col>
);

// Require a document to be passed to this component.
SimModelItem.propTypes = {
  model: PropTypes.shape({
    owner: PropTypes.string,
    name: PropTypes.string,
    base64: PropTypes.string,
    like: PropTypes.number,
    dislike: PropTypes.number,
    cost: PropTypes.number,
    _id: PropTypes.string,
  }).isRequired,
};

export default SimModelItem;
