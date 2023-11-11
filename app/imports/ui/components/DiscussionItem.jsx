import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Container, Row, Col } from 'react-bootstrap';
import { useTracker } from 'meteor/react-meteor-data';
import { HandThumbsDownFill, HandThumbsUpFill } from 'react-bootstrap-icons';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import { Discussions } from '../../api/discussion/Discussion';

const DiscussionItem = ({ item }) => {
  const { ready, model, type, thread, simulation } = useTracker(() => {
    const subscription = Meteor.subscribe(Models.userPublicationName);
    const simSubscription = Meteor.subscribe(Simulations.userPublicationName);
    const discSubscription = Meteor.subscribe(Discussions.userPublicationName);

    const rdy = subscription.ready() && discSubscription.ready() && simSubscription.ready();

    const modelItem = Models.collection.findOne({ show: true, _id: item.typeID });
    const simItem = Simulations.collection.findOne({ _id: item.typeID });
    const threadItem = Discussions.collection.findOne({ _id: item._id });

    let itemType;
    if (modelItem) {
      itemType = 'model';
    } else if (simItem) {
      itemType = 'simulation';
    } else {
      itemType = 'thread';
    }

    return {
      model: modelItem,
      simulation: simItem,
      ready: rdy,
      type: itemType,
      thread: threadItem,
    };
  }, []);

  console.log(model);

  const containerStyle = { borderWidth: 0.5, borderColor: 'grey', borderStyle: 'solid', borderRadius: 5, padding: 10, margin: 10, width: '95%', display: 'flex', minWidth: '400px' };

  return (
    (ready ? (
      <a href={`/${type}/${(type === 'model' || type === 'simulation') ? item.typeID : item._id}`} style={{ textDecoration: 'none', color: 'black' }}>
        <Container style={containerStyle}>
          <Row style={{ padding: 5, width: '100%' }}>
            <Col md={10}>
              <h3>
                {type === 'model' ? model?.name : thread?.title}
              </h3>
              <Row style={{ color: 'grey' }}>{item.owner}</Row>
            </Col>
            <Col md={2}>
              <Row>
                <Col>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {item.typeID !== undefined ?
                    type === 'model' ? model.like : simulation.like
                    : thread.likes}
                  <HandThumbsUpFill id="thumbs-up-fill" size={30} color="green" />
                </Col>

                <Col>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {item.typeID !== undefined ?
                    type === 'model' ? model.dislike : simulation.dislike
                    : thread.dislikes}
                  <HandThumbsDownFill id="thumbs-down-fill" size={30} color="red" />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </a>
    )
      : ' ')
  );
};

DiscussionItem.propTypes = {
  item: PropTypes.shape({
    owner: PropTypes.string.isRequired,
    typeID: PropTypes.string,
    name: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};

export default DiscussionItem;
