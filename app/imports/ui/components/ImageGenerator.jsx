import React, { useState, useEffect } from 'react';
import { Button, Image, Form, Row, Col, Container, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { BsXCircle } from 'react-icons/bs';
import LoadingSpinner from './LoadingSpinner';

const ImageGenerator = ({ inspirationPhotos, setInspirationPhotos, dallePhotos, setDallePhotos }) => {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  // Multiple Uploads
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const deleteImage = (indexToDelete) => {
    const updatedItems = inspirationPhotos.filter((_, index) => index !== indexToDelete);
    setInspirationPhotos(updatedItems);
  };
  const files = inspirationPhotos.map((file, index) => (
    <li key={index}>
      {file.name} - {file.size} bytes
      <Button size="sm" variant="link" onClick={() => deleteImage(index)}><BsXCircle /></Button>
    </li>
  ));
  const [imageResult, setImageResult] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const n = 2;
  const size = '256x256';
  const dalle = () => {
    setImageResult(null);
    setLoading(true);
    Meteor.call('createImage', input, n, size, (error, result) => {
      if (error) {
        console.error(error.reason);
        setLoading(false);
      } else {
        // Handle the result here
        setImageResult(result.data[0].url);
        setLoading(false);
      }
    });
  };
  const dalleAdd = async () => {
    setDallePhotos([...dallePhotos, imageResult]);
    swal('Success', 'Dall-e image added successfully', 'success');
  };
  const dalleDelete = (indexToDelete) => {
    const updatedItems = dallePhotos.filter((_, index) => index !== indexToDelete);
    setDallePhotos(updatedItems);
  };
  useEffect(() => {
    setInspirationPhotos([...inspirationPhotos, ...acceptedFiles]);
  }, [acceptedFiles]);
  return (
    <Col>
      <p style={{ fontSize: 20 }}>Upload Photo Inspiration</p>
      <Row>
        <Container>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <div {...getRootProps({ className: 'dropzone' })}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <input {...getInputProps()} />
            <p style={{ marginBottom: '0px' }}>Drag &apos;n&apos; drop some files here, or click to select files</p>
          </div>
          <aside>
            <ul>{files}</ul>
          </aside>
        </Container>
      </Row>
      <Row>
        <p style={{ fontSize: 20 }}>AI Generated Photo Inspiration</p>
        <Button id="dall-e-generator" style={{ fontSize: '20px' }} onClick={handleShow}>
          Dall-E Image Generator
        </Button>
        <Modal size="lg" centered show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Dall-E Image Generator</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Text className="text-muted">Dall-E is an AI system that can create realistic images and art from a description.</Form.Text>
              <br />
              <Form.Label>Enter a detailed description</Form.Label>
              <Form.Group className="d-flex mb-3">
                <Form.Control style={{ borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }} type="prompt" placeholder="A community park with lots of trees..." onChange={(e) => setInput(e.target.value)} />
                <Button disabled={!input} id="dall-e-generate" onClick={dalle}>
                  Generate
                </Button>
              </Form.Group>
            </Form>
            <br />
            { imageResult ? (
              <Container className="text-center">
                <Image src={imageResult} style={{ width: '80%' }} />
                <br />
                <br />
                <p style={{ margin: '0px' }}>Like the image? Add it to your model!</p>
                <p>Try again by entering a new description and generate a new image.</p>
                <Button variant="success" onClick={dalleAdd}>Add Photo</Button>
                <br />
                <br />
              </Container>
            )
              : ' ' }
            { loading ? <LoadingSpinner /> : ' '}
            {dallePhotos.length > 0 ? (
              <Container id="ai-photos-modal" className="shadow-lg p-3 mb-5 bg-white rounded">
                <Row>
                  <h4>Your AI Photos</h4>
                </Row>
                <Row className="d-flex flex-wrap">
                  {dallePhotos.map((image, index) => (
                    <Col key={index}>
                      <div style={{ padding: 5 }} className="d-flex">
                        <Image src={image} style={{ width: '300px' }} />
                        <OverlayTrigger
                          trigger={['hover']}
                          placement="right"
                          delay={{ show: 250, hide: 400 }}
                          overlay={<Tooltip>Delete image?</Tooltip>}
                        >
                          <Button size="sm" variant="link" onClick={() => dalleDelete(index)}><BsXCircle /></Button>
                        </OverlayTrigger>
                        <br />
                      </div>
                    </Col>
                  ))}
                </Row>
              </Container>
            ) : ''}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <br />
      </Row>
      <br />
    </Col>
  );
};

ImageGenerator.propTypes = {
  setInspirationPhotos: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  inspirationPhotos: PropTypes.arrayOf(PropTypes.object).isRequired,
  setDallePhotos: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  dallePhotos: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ImageGenerator;
