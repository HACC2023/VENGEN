import React, { useState, useRef } from 'react';
import { Button, Container, Image, InputGroup } from 'react-bootstrap';
import swal from 'sweetalert';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import { Discussions } from '../../api/discussion/Discussion';
import Message from './Message';

const DiscussionPanel = ({ id, type }) => {
  // eslint-disable-next-line no-unused-vars
  const [state, setState] = useState({
    message: '',
  });
  const containerRef = useRef(null);
  const { ready, discussion } = useTracker(() => {
    // Get access to Discussions documents.
    const subscription = Meteor.subscribe(Discussions.userPublicationName);
    // Determine if the subscription is ready
    const rdy = subscription.ready();
    // Get the Discussions documents
    const disc = Discussions.collection.findOne({ typeID: id });
    return {
      discussion: disc,
      ready: rdy,
    };
  }, []);

  const simContainerStyle = { maxHeight: '500px', padding: 0, display: 'flex', flexDirection: 'column', width: '100%' };
  const modelContainerStyle = { borderRadius: 5, borderWidth: 1, borderColor: 'black', borderStyle: 'solid', height: '80vh', padding: 0, display: 'flex', flexDirection: 'column' };
  const inputStyle = { borderColor: 'black', borderTop: 'solid', borderWidth: 0.1, minHeight: '100px', margin: 'auto 0 0', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const containerStyle = type === 'model' ? modelContainerStyle : simContainerStyle;

  const handleSubmit = () => {
    if (document.getElementById('message-input').value !== '') {
      state.message = document.getElementById('message-input').value;
      const owner = Meteor.user().username;
      const messageArr = discussion.messages;
      const discID = discussion._id;
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

  document.addEventListener('keydown', function (event) {
    if (event.code === 'Enter') {
      event.preventDefault();
      document.getElementById('discussion-button').click();
    }
  });

  const inputDiv = () => (
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
              <Button variant="outline-secondary" id="discussion-button" type="submit" onClick={handleSubmit}>
                Submit
              </Button>
            </InputGroup>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <Container id="messages-background" style={containerStyle}>
      {
        type === 'model' ?
          <h2 style={{ margin: 15 }}>Discussions</h2> :
          <h2 style={{ margin: 15 }}>Community Feedback</h2>
      }

      {type === 'simulation' ? inputDiv() : ''}

      <div style={{ overflowY: 'auto' }} ref={containerRef}>
        {(ready && discussion && discussion.messages.length !== 0) ? (
          <div>
            {discussion.messages.map((item, index) => (
              <Message key={index} message={item} id={discussion._id} />
            ))}
          </div>
        ) : <p className="text-center">No messages in this discussion</p>}
      </div>
      {type === 'model' ? inputDiv() : ''}
    </Container>
  );

};

DiscussionPanel.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default DiscussionPanel;
