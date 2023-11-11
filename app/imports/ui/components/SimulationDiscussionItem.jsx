import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row } from 'react-bootstrap';
import { HandThumbsDown, HandThumbsUpFill } from 'react-bootstrap-icons';

const SimulationDiscussionItem = ({ item }) => {

  const containerStyle = { borderWidth: 0.5, borderColor: '#dee2e6', borderStyle: 'solid', borderRadius: 5, padding: 10, margin: 10, width: '95%', display: 'flex', minWidth: '400px' };

  return (
    <a href={`/simulation/${item._id}`} style={{ textDecoration: 'none', color: 'black' }}>
      <Container style={containerStyle} className="d-block simulation-discussion-item mb-4">
        <Row style={{ padding: 5, width: '100%' }}>
          <h3 style={{ marginBottom: '0px' }}>
            {item.name}
          </h3>
        </Row>
        <Row style={{ padding: 5, color: 'grey' }}>
          <p style={{ marginBottom: '0px' }}>
            {item.owner}
          </p>
        </Row>
        <Row style={{ padding: 5 }}>
          <div id="segmented-buttons-wrapper" style={{ paddingLeft: '12px' }}>
            <div id="segmented-like-button">
              <HandThumbsUpFill id="thumbs-up-fill" size={25} color="green" />
              <h5 style={{ marginBottom: '0px' }}>{item.like}</h5>
            </div>
            <div id="segmented-dislike-button">
              <HandThumbsDown id="thumbs-down" size={25} color="black" />
              <h5 style={{ marginBottom: '0px' }}>{item.dislike}</h5>
            </div>
          </div>
        </Row>
      </Container>
    </a>
  );
};

SimulationDiscussionItem.propTypes = {
  item: PropTypes.shape({
    owner: PropTypes.string.isRequired,
    typeID: PropTypes.string,
    name: PropTypes.string,
    _id: PropTypes.string,
    like: PropTypes.number,
    dislike: PropTypes.number,
  }).isRequired,
};

export default SimulationDiscussionItem;
