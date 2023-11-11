import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import swal from 'sweetalert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { PlusCircle } from 'react-bootstrap-icons';
import { Form } from 'react-bootstrap';
import { Discussions } from '../../api/discussion/Discussion';

const ThreadModal = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = () => {
    const owner = Meteor.user().username;
    const title = document.getElementById('thread-title').value;
    const message = document.getElementById('thread-message').value;

    if (title !== '' && message !== '') {
      const messageArr = [];
      messageArr.push({
        id: messageArr.length,
        user: owner,
        message: message,
        time: new Date(),
        likes: 0,
        dislikes: 0,
      });

      Discussions.collection.insert(
        { type: 'thread', title: title, owner: Meteor.user().username, messages: messageArr, likes: 0, dislikes: 0 },
        (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            swal('Success', 'Your new thread has been uploaded!', 'success');
          }
        },
      );

      handleClose();
    }
  };

  return (
    <>
      <Button id="new-thread-button" onClick={handleShow}>
        New Thread&nbsp;
        <PlusCircle />
      </Button>

      <Modal
        centered
        show={show}
        onHide={handleClose}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create a new discussion thread</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Thread Title</Form.Label>
              <Form.Control
                type="title"
                placeholder="How can we rebuild ..."
                autoFocus
                id="thread-title"
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Start a discussion</Form.Label>
              <Form.Control as="textarea" rows={3} id="thread-message" placeholder="Write your first message here ..." />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ThreadModal;
