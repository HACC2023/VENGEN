import React from 'react';
import { Card, Col } from 'react-bootstrap';
import { HandThumbsDownFill, HandThumbsUpFill } from 'react-bootstrap-icons';
import PropTypes from 'prop-types';

/** Renders a single row in the List Stuff table. See pages/ListStuff.jsx. */
const SimulationItem = ({ sim }) => (
  <Col className="my-4">
    <a href={`/simulation/${sim._id}`} style={{ textDecoration: 'none' }}>
      <Card>
        <Card.Img variant="top" src={sim.base64} />
        <Card.Body className="py-1">
          <Card.Title className="mb-0">{sim.name}</Card.Title>
          <span>{sim.owner}</span>
          <div style={{ float: 'right' }}>
            <HandThumbsUpFill color="green" />
            <span style={{ marginRight: 5 }}>{sim.like}</span>
            <HandThumbsDownFill color="red" />
            <span>{sim.dislike}</span>
          </div>
        </Card.Body>
      </Card>
    </a>
  </Col>
);

// Require a document to be passed to this component.
SimulationItem.propTypes = {
  sim: PropTypes.shape({
    owner: PropTypes.string,
    name: PropTypes.string,
    base64: PropTypes.string,
    like: PropTypes.number,
    dislike: PropTypes.number,
    cost: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    models: PropTypes.array,
    _id: PropTypes.string,
  }).isRequired,
};

export default SimulationItem;
