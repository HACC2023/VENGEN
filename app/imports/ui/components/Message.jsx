import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Container, Image, Row } from 'react-bootstrap';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { HandThumbsDown, HandThumbsDownFill, HandThumbsUp, HandThumbsUpFill } from 'react-bootstrap-icons';
import { Users } from '../../api/user/User';
import { Discussions } from '../../api/discussion/Discussion';

const Message = ({ message, id }) => {
  const messageId = `${id}_${message.id}`;

  const { ready, discussion } = useTracker(() => {
    // Get access to Discussions documents.
    const usrSubscription = Meteor.subscribe(Users.userPublicationName);
    const subscription = Meteor.subscribe(Discussions.userPublicationName);
    // Determine if the subscription is ready
    const rdy = usrSubscription.ready() && subscription.ready();
    // Get the Discussions documents
    const disc = Discussions.collection.findOne({ _id: id });
    return {
      discussion: disc,
      ready: rdy,
    };
  }, []);

  // eslint-disable-next-line no-unused-vars
  const [state, setState] = useState({
    likes: discussion.messages[message.id].likes,
    dislikes: discussion.messages[message.id].dislikes,
  });

  const handleLikeDislike = (likeDislike) => {
    const me = Users.collection.findOne({ _id: Meteor.user()._id });
    const likes = me.likes;
    const dislikes = me.dislikes;
    const likeIndex = likes.indexOf(messageId);
    const dislikeIndex = dislikes.indexOf(messageId);

    if (likeDislike === 'like') {
      if (likeIndex >= 0) {
        likes.splice(likeIndex, 1);
        discussion.messages[message.id].likes--;
      } else if (dislikeIndex >= 0) {
        dislikes.splice(dislikeIndex, 1);
        likes.push(messageId);
        discussion.messages[message.id].dislikes--;
        discussion.messages[message.id].likes++;
      } else {
        likes.push(messageId);
        discussion.messages[message.id].likes++;
      }
      Users.collection.update(me._id, { $set: { dislikes, likes } });
    } else {
      if (dislikeIndex >= 0) {
        dislikes.splice(dislikeIndex, 1);
        discussion.messages[message.id].dislikes--;
      } else if (likeIndex >= 0) {
        likes.splice(likeIndex, 1);
        dislikes.push(messageId);
        discussion.messages[message.id].likes--;
        discussion.messages[message.id].dislikes++;
      } else {
        dislikes.push(messageId);
        discussion.messages[message.id].dislikes++;
      }
      Users.collection.update(me._id, { $set: { dislikes, likes } });
    }

    state.likes = discussion.messages[message.id].likes;
    state.dislikes = discussion.messages[message.id].dislikes;
    Discussions.collection.update(
      { _id: id },
      { $set: { messages: discussion.messages } },
    );
  };

  return ready && discussion ? (
    <Container className="mb-3" style={{ borderWidth: 0.5, borderColor: '#dee2e6', borderStyle: 'solid', borderRadius: 5, margin: 10, padding: 10, width: '95%', minWidth: '400px' }}>
      <Row style={{ width: '100%', marginBottom: 5 }} className="d-flex align-items-center">
        <Col xs={2} className="d-flex justify-content-center align-items-center">
          <Image roundedCircle src="/images/pfp.jpg" width="40vh" />
        </Col>

        <Col>
          <Row style={{ padding: 0, marginBottom: 10 }}>
            <Row style={{ display: 'flex', padding: 0 }}>
              <Col md={8} className="d-flex align-items-center" style={{ color: 'grey' }}>
                {message.user}
              </Col>

              <Col md={4} style={{ padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {(Users.collection.findOne(Meteor.user()._id)?.likes.indexOf(messageId) >= 0) ? (
                    <span>
                      <HandThumbsUpFill id="thumbs-up-fill" size={30} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} />
                      <HandThumbsUp id="thumbs-up" size={30} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} hidden />
                    </span>
                  ) : (
                    <span>
                      <HandThumbsUpFill id="thumbs-up-fill" size={30} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} hidden />
                      <HandThumbsUp id="thumbs-up" size={30} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} />
                    </span>
                  )}

                  <span style={{ fontSize: 20, marginRight: 10 }}>{state.likes}</span>
                  {(Users.collection.findOne(Meteor.user()._id)?.dislikes.indexOf(messageId) >= 0) ? (
                    <span>
                      <HandThumbsDownFill id="thumbs-down-fill" size={30} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} />
                      <HandThumbsDown id="thumbs-down" size={30} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} hidden />
                    </span>
                  ) : (
                    <span>
                      <HandThumbsDownFill id="thumbs-down-fill" size={30} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} hidden />
                      <HandThumbsDown id="thumbs-down" size={30} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} />
                    </span>
                  )}
                  <span style={{ fontSize: 20 }}>{state.dislikes}</span>
                </div>
              </Col>
            </Row>
          </Row>

        </Col>
      </Row>

      <Row style={{ width: '100%' }}>
        <Col xs={1} />
        <Col style={{ wordBreak: 'break-word', padding: '0px' }}>
          {message.message}
        </Col>
      </Row>
    </Container>
  ) : '';

};

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number,
    user: PropTypes.string,
    message: PropTypes.string,
    likes: PropTypes.number,
    dislikes: PropTypes.number,
  }).isRequired,
  id: PropTypes.string.isRequired,
};

export default Message;
