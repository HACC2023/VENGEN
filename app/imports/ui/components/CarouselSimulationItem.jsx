import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';

const SimulationItem = ({ simulations }) => (
  <Row>
    {simulations.map((sim) => (
      <Col md lg="4" key={sim._id}>
        <a href={`/simulation/${sim._id}`} style={{ textDecoration: 'none' }}>
          <Card>
            <Card.Img variant="top" src={sim.base64} className="sim-card-item" />
          </Card>
          <b style={{ color: 'black' }}>{sim.name}</b>
        </a>
      </Col>
    ))}
  </Row>
);

// Require a document to be passed to this component.
SimulationItem.propTypes = {
  simulations: PropTypes.arrayOf(
    PropTypes.shape({
      owner: PropTypes.string,
      name: PropTypes.string,
      base64: PropTypes.string,
      like: PropTypes.number,
      dislike: PropTypes.number,
      cost: PropTypes.number,
      // eslint-disable-next-line react/forbid-prop-types
      models: PropTypes.array,
      _id: PropTypes.string,
    }),
  ).isRequired,
};

export default SimulationItem;
