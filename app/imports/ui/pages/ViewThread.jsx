import React, { useState, useRef } from 'react';
import { Roles } from 'meteor/alanning:roles';
import { Button, Container, Image, InputGroup, Row, Col, Modal } from 'react-bootstrap';
import swal from 'sweetalert';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Form from 'react-bootstrap/Form';
import {
  ExclamationTriangle,
  HandThumbsDown,
  HandThumbsDownFill,
  HandThumbsUp,
  HandThumbsUpFill,
} from 'react-bootstrap-icons';
import { useParams } from 'react-router';
import { Users } from '../../api/user/User';
import { Discussions } from '../../api/discussion/Discussion';
import Message from '../components/Message';
import LoadingSpinner from '../components/LoadingSpinner';

const ViewThread = () => {
  const { _id } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [state, setState] = useState({
    message: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const containerRef = useRef(null);
  const { ready, thread } = useTracker(() => {
    // Get access to Discussions documents.
    const subscription = Meteor.subscribe(Discussions.userPublicationName);
    const usrSubscription = Meteor.subscribe(Users.userPublicationName);
    // Determine if the subscription is ready
    const rdy = usrSubscription.ready() && subscription.ready();
    // Get the Discussions documents
    const disc = Discussions.collection.findOne({ _id: _id });
    return {
      thread: disc,
      ready: rdy,
    };
  }, []);

  const containerStyle = { maxHeight: '90vh', padding: 0, display: 'flex', flexDirection: 'column', width: '100%' };
  const inputStyle = { borderColor: 'black', borderTop: 'solid', borderWidth: 0.1, minHeight: '100px', margin: 'auto 0 0', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const handleSubmit = () => {
    if (document.getElementById('message-input').value !== '') {
      state.message = document.getElementById('message-input').value;
      const owner = Meteor.user().username;
      const messageArr = thread.messages;
      const discID = thread._id;
      messageArr.push({
        id: (messageArr.length > 0) ? messageArr[messageArr.length - 1].id + 1 : 0,
        user: owner,
        message: state.message,
        time: new Date(),
        likes: 0,
        dislikes: 0,
      });

      Discussions.collection.update(
        { _id: discID },
        { $set: { messages: messageArr } },
        (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            document.getElementById('message-input').value = '';
            setState({ message: '' });

            if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
          }
        },
      );

      document.getElementById('message-input').value = '';
    }
  };

  const deleteThread = () => {
    Discussions.collection.remove({ _id: _id });
    setShowDeleteModal(false);
    window.location.replace('/Discussions');
  };

  const handleLikeDislike = (likeDislike) => {
    const me = Users.collection.findOne(Meteor.user()._id);
    const likes = me.likes;
    const dislikes = me.dislikes;
    const dislikeIndex = dislikes.indexOf(_id);
    const likeIndex = likes.indexOf(_id);

    if (likeDislike === 'like') {
      if (likeIndex >= 0) {
        likes.splice(likeIndex, 1);
        Discussions.collection.update(_id, { $set: { likes: thread.likes - 1 } });
      } else if (dislikeIndex >= 0) {
        dislikes.splice(dislikeIndex, 1);
        likes.push(_id);
        Discussions.collection.update(_id, { $set: { dislikes: thread.dislikes - 1, likes: thread.likes + 1 } });
      } else {
        likes.push(_id);
        Discussions.collection.update(_id, { $set: { likes: thread.likes + 1 } });
      }
    } else if (dislikeIndex >= 0) {
      dislikes.splice(dislikeIndex, 1);
      Discussions.collection.update(_id, { $set: { dislikes: thread.dislikes - 1 } });
    } else if (likeIndex >= 0) {
      likes.splice(likeIndex, 1);
      dislikes.push(_id);
      Discussions.collection.update(_id, { $set: { likes: thread.likes - 1, dislikes: thread.dislikes + 1 } });
    } else {
      dislikes.push(_id);
      Discussions.collection.update(_id, { $set: { dislikes: thread.dislikes + 1 } });
    }
    Users.collection.update(me._id, { $set: { likes, dislikes } });
  };

  document.addEventListener('keydown', function (event) {
    if (event.code === 'Enter') {
      event.preventDefault();
      document.getElementById('thread-button').click();
    }
  });

  return ready && thread ? (
    <Container id="messages-background" style={containerStyle}>
      <Row className="align-items-center">
        <Col>
          <h2 style={{ wordBreak: 'break-word' }}>{thread?.title}</h2>
          <p style={{ color: 'grey' }}>Created by: {thread?.owner}</p>
        </Col>
        <Col>
          <p style={{ textAlign: 'right' }}>{thread.messages[0].time.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
          {(thread.owner === Meteor.user().username || Roles.userIsInRole(Meteor.user(), ['admin'])) ? (
            <div className="mb-2" style={{ float: 'right' }}>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete Thread</Button>
            </div>
          ) : ''}
          <div style={{ float: 'right', padding: '0px', marginRight: '2em' }} id="segmented-buttons-wrapper">
            <div id="segmented-like-button">
              {(Users.collection.findOne(Meteor.user()._id).likes.indexOf(_id) >= 0) ? (
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
              <span style={{ fontSize: 20, marginRight: 10 }}>{thread.likes}</span>
            </div>
            <div id="segmented-dislike-button">
              {(Users.collection.findOne(Meteor.user()._id).dislikes.indexOf(_id) >= 0) ? (
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
              <span style={{ fontSize: 20 }}>{thread.dislikes}</span>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="my-4">
        <p style={{ wordWrap: 'break-word', lineHeight: 'normal' }}>{thread.messages[0].message}</p>
      </Row>

      <div id="discussion-input-box" style={inputStyle}>
        <div className="d-flex flex-row justify-content-between align-items-center w-100">
          <div>
            <Image className="mx-2" roundedCircle src="/images/pfp.jpg" width="40vh" />
          </div>

          <div style={{ width: '100%' }}>
            <div className="flex-grow-1 me-2">
              <InputGroup>
                <Form.Control
                  placeholder="Add a comment ...."
                  value={state.value}
                  id="message-input"
                />
                <Button variant="outline-secondary" id="thread-button" type="submit" onClick={handleSubmit}>
                  Submit
                </Button>
              </InputGroup>
            </div>

          </div>
        </div>
      </div>

      <div style={{ overflowY: 'auto' }} ref={containerRef}>
        {(ready && thread && thread.messages.length !== 0) ? (
          <div>
            {thread.messages.slice(1).map((item, index) => (
              <Message key={index} message={item} id={_id} />
            ))}
          </div>
        ) : <p className="text-center">No messages in this discussion</p>}
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} style={{ marginTop: '20vh' }}>
        <Modal.Body className="py-5" style={{ textAlign: 'center' }}>
          <ExclamationTriangle color="red" style={{ fontSize: '5vw' }} />
          <h2>Are you sure?</h2>
          <p><b>You are about to delete this thread.</b></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteThread}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  ) : <LoadingSpinner />;

};

export default ViewThread;
