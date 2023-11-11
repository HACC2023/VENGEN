import React from 'react';
import { Card, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { HandThumbsDownFill, HandThumbsUpFill } from 'react-bootstrap-icons';

/** Renders a single row in the List Stuff table. See pages/ListStuff.jsx. */
const ModelItem = ({ model }) => (
  <Col className="mb-5">
    <a href={`/model/${model._id}`} style={{ textDecoration: 'none' }}>
      <Card>
        <Card.Img variant="top" src={model.base64} />
        <Card.Body className="py-1">
          <Card.Title className="mb-0">{model.name}</Card.Title>
          <span>{model.owner}</span>
          <div style={{ float: 'right' }}>
            <HandThumbsUpFill color="green" />
            <span style={{ marginRight: 5 }}>{model.like}</span>
            <HandThumbsDownFill color="red" />
            <span>{model.dislike}</span>
          </div>
        </Card.Body>
      </Card>
    </a>
  </Col>
);

// Require a document to be passed to this component.
ModelItem.propTypes = {
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

export default ModelItem;
