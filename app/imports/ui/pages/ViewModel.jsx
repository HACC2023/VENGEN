import React, { useEffect, useState } from 'react';
import { Roles } from 'meteor/alanning:roles';
import { Col, Container, Image, Row, Button, Modal, Accordion } from 'react-bootstrap';
import { HandThumbsUpFill, HandThumbsDown, HandThumbsDownFill, HandThumbsUp, ExclamationTriangle } from 'react-bootstrap-icons';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useParams } from 'react-router';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import LoadingSpinner from '../components/LoadingSpinner';
import { Models } from '../../api/model/Model';
import { Users } from '../../api/user/User';
import '../../../client/style.css';
import { Images } from '../../api/images/client/images';
import DiscussionPanel from '../components/DicussionPanel';

let scene;
let camera;
let renderer;

const ViewModel = () => {
  const { _id } = useParams();

  const { model, ready } = useTracker(() => {
    // Get access to Stuff documents.
    const subscription = Meteor.subscribe(Models.userPublicationName);
    const userSubscription = Meteor.subscribe(Users.userPublicationName);
    const imageSubscription = Meteor.subscribe('images.all');
    // Determine if the subscription is ready
    const rdy = subscription.ready() && imageSubscription.ready() && userSubscription.ready();
    // Get the document
    const modelItem = Models.collection.findOne(_id);
    return {
      model: modelItem,
      ready: rdy,
    };
  }, [_id]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteModel = () => {
    Models.collection.update(_id, { $set: { show: false } });
    setShowDeleteModal(false);
    window.location.replace('/gallery');
  };

  const handleLikeDislike = (likeDislike) => {
    const me = Users.collection.findOne(Meteor.user()._id);
    const likes = me.likes;
    const dislikes = me.dislikes;
    const likeIndex = likes.indexOf(_id);
    const dislikeIndex = dislikes.indexOf(_id);

    if (likeDislike === 'like') {
      if (likeIndex >= 0) {
        likes.splice(likeIndex, 1);
        Models.collection.update(_id, { $set: { like: model.like - 1 } });
      } else if (dislikeIndex >= 0) {
        likes.push(_id);
        dislikes.splice(dislikeIndex, 1);
        Models.collection.update(_id, { $set: { like: model.like + 1, dislike: model.dislike - 1 } });
      } else {
        likes.push(_id);
        Models.collection.update(_id, { $set: { like: model.like + 1 } });
      }
    } else if (dislikeIndex >= 0) {
      dislikes.splice(dislikeIndex, 1);
      Models.collection.update(_id, { $set: { dislike: model.dislike - 1 } });
    } else if (likeIndex >= 0) {
      likes.splice(likeIndex, 1);
      dislikes.push(_id);
      Models.collection.update(_id, { $set: { dislike: model.dislike + 1, like: model.like - 1 } });
    } else {
      dislikes.push(_id);
      Models.collection.update(_id, { $set: { dislike: model.dislike + 1 } });
    }
    Users.collection.update(me._id, { $set: { likes, dislikes } });
  };

  const animate = () => {
    renderer.state.reset();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  const initScene = async () => {
    if (scene) return;

    const modelFrame = document.getElementById('modelFrame');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF2F2F2);

    camera = new THREE.PerspectiveCamera(30, modelFrame.clientWidth / modelFrame.clientHeight, 0.1, 10000);
    camera.rotation.x = model.cameraRotation.x;
    camera.rotation.y = model.cameraRotation.y;
    camera.rotation.z = model.cameraRotation.z;
    camera.position.x = model.cameraPosition.x;
    camera.position.y = model.cameraPosition.y;
    camera.position.z = model.cameraPosition.z;

    // eslint-disable-next-line no-unused-vars
    const controls = new OrbitControls(camera, modelFrame);

    const hlight = new THREE.AmbientLight(0x404040, 100);
    scene.add(hlight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 100);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const light = new THREE.PointLight(0xC4C4C4, 10);
    light.position.set(0, 300, 500);
    scene.add(light);

    const light2 = new THREE.PointLight(0xC4C4C4, 10);
    light2.position.set(500, 100, 0);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xC4C4C4, 10);
    light3.position.set(0, 100, -500);
    scene.add(light3);

    const light4 = new THREE.PointLight(0xC4C4C4, 10);
    light4.position.set(-500, 300, 0);
    scene.add(light4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(modelFrame.clientWidth, modelFrame.clientHeight);

    const loader = new GLTFLoader();
    const s3Link = Images.findOne({ _id: model.modelS3 });
    const s3URL = s3Link.link();
    await loader.load(s3URL, function (gltf) {
      gltf.scene.position.set(0, 0, 0);
      gltf.scene.scale.set(1, 1, 1);
      scene.add(gltf.scene);
      animate();
    });

    modelFrame.appendChild(renderer.domElement);
  };

  let dalleGallery = [];
  const userGallery = [];
  if (ready) {
    dalleGallery = model.dalleImage;
    model.imageInspiration.forEach((img) => {
      const s3Link = Images.findOne({ _id: img }).link();
      userGallery.push(s3Link);
    });
  }

  useEffect(() => {
    if (ready) {
      initScene();
    }
  });

  // eslint-disable-next-line no-unused-vars
  window.addEventListener('resize', function (event) {
    const modelFrame = document.getElementById('modelFrame');
    modelFrame.style.height = `${modelFrame.clientWidth}px`;
    renderer.setSize(modelFrame.clientWidth, modelFrame.clientHeight);
  }, true);

  return ready ? (
    <Container className="py-3 mt-3">
      <Row className="mb-1">
        <Col>
          { (model.owner === Meteor.user().username || Roles.userIsInRole(Meteor.user(), ['admin'])) ? (
            <Button variant="danger" style={{ float: 'right' }} onClick={() => setShowDeleteModal(true)}>Delete Model</Button>
          ) : '' }
        </Col>
      </Row>
      <Row>
        <Col xs lg="6">
          <div id="modelFrame" style={{ border: '1px solid black', aspectRatio: 1, width: '100%' }} />
          <Row className="mt-2 align-items-center">
            <Col>
              <h2 style={{ marginBottom: '0' }}>{model.name}</h2>
            </Col>
            <Col>
              <div style={{ float: 'right' }} id="segmented-buttons-wrapper">
                <div id="segmented-like-button">
                  {(Users.collection.findOne(Meteor.user()._id).likes.indexOf(_id) >= 0) ? (
                    <span>
                      <HandThumbsUpFill id="thumbs-up-fill" size={25} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} />
                      <HandThumbsUp id="thumbs-up" size={25} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} hidden />
                    </span>
                  ) : (
                    <span>
                      <HandThumbsUpFill id="thumbs-up-fill" size={25} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} hidden />
                      <HandThumbsUp id="thumbs-up" size={25} color="green" className="mouse-hover-click" onClick={() => handleLikeDislike('like')} />
                    </span>
                  )}
                  <span style={{ fontSize: 20, color: 'black' }}>{model.like}</span>
                </div>
                <div id="segmented-dislike-button">
                  {(Users.collection.findOne(Meteor.user()._id).dislikes.indexOf(_id) >= 0) ? (
                    <span>
                      <HandThumbsDownFill id="thumbs-down-fill" size={25} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} />
                      <HandThumbsDown id="thumbs-down" size={25} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} hidden />
                    </span>
                  ) : (
                    <span>
                      <HandThumbsDownFill id="thumbs-down-fill" size={25} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} hidden />
                      <HandThumbsDown id="thumbs-down" size={25} color="black" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} />
                    </span>
                  )}
                  <span style={{ fontSize: 20, color: 'black' }}>{model.dislike}</span>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col>
              <h5>{model.owner}</h5>
            </Col>
          </Row>
          {(model.cost !== undefined) ? (
            <Row id="additional-information">
              <h5 className="mt-1">Data Dashboard</h5>
              <p>Estimated Cost: ${model.cost}</p>
            </Row>
          ) : ''}
        </Col>
        <Col xs lg="6">
          <DiscussionPanel id={_id} type="model" />
        </Col>
      </Row>
      <Row id="user-gallery">
        <Accordion className="shadow-lg bg-white rounded">
          <Accordion className="Item">
            <Accordion.Header>
              <h2>User Gallery</h2>
            </Accordion.Header>
            <Accordion.Body className="d-flex flex-wrap">
              {userGallery.length === 0 ? (
                <h4>No Photos Available</h4>
              ) : userGallery.map((image, index) => (
                <div key={index} style={{ padding: 3 }}>
                  <Image src={image} style={{ width: '300px' }} />
                </div>
              ))}
            </Accordion.Body>
          </Accordion>
        </Accordion>
      </Row>
      <Row id="dall-e-gallery">
        <Accordion className="shadow-lg bg-white rounded">
          <Accordion className="Item">
            <Accordion.Header>
              <h2>Dall-e Gallery</h2>
            </Accordion.Header>
            <Accordion.Body className="d-flex flex-wrap">
              {dalleGallery.length === 0 ? (
                <h4>No Photos Available</h4>
              ) : dalleGallery.map((image, index) => (
                <div key={index} style={{ padding: 3 }}>
                  <Image src={image} style={{ width: '300px' }} />
                </div>
              ))}
            </Accordion.Body>
          </Accordion>
        </Accordion>
      </Row>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} style={{ marginTop: '20vh' }}>
        <Modal.Body className="py-5 px-5" style={{ textAlign: 'center' }}>
          <ExclamationTriangle color="red" style={{ fontSize: '5vw' }} />
          <h2>Are you sure?</h2>
          <p><b>You are about to delete this model.</b></p>
          <p>
            Note: This means the public will no longer have access to your model. You will still be able to see this model under your profile.
            Any existing simulations that use your model will still be available, but new simulations will not be able to add this model.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteModel}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  ) : <LoadingSpinner />;
};

export default ViewModel;
