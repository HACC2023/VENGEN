import React from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { HandThumbsDownFill, HandThumbsUpFill } from 'react-bootstrap-icons';

/** Renders a single row in the List Stuff table. See pages/ListStuff.jsx. */
const HomeModelItem = ({ model }) => (
  <>
    <a href={`/model/${model._id}`} style={{ textDecoration: 'none' }}>
      <Row className="mb-2">
        <Col xs lg="4">
          <Image src={model.base64} style={{ width: '100%' }} />
        </Col>
        <Col style={{ color: 'black' }}>
          <b style={{ fontSize: '20px' }}>{model.name}</b>
          <div style={{ float: 'right' }}>
            <HandThumbsUpFill color="green" />
            <span style={{ marginRight: 5 }}>{model.like}</span>
            <HandThumbsDownFill color="red" />
            <span>{model.dislike}</span>
          </div>
          <p style={{ fontSize: '14px' }}>By: {model.owner}</p>
        </Col>
      </Row>
    </a>
    <hr />
  </>
);

// Require a document to be passed to this component.
HomeModelItem.propTypes = {
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

export default HomeModelItem;
