import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Models } from '../../api/model/Model';
import { Discussions } from '../../api/discussion/Discussion';
import { Images } from '../../api/images/client/images';
import ImageGenerator from '../components/ImageGenerator';

let scene;
let camera;
let renderer;

let modelBase64;

/* Renders the AddStuff page for adding a document. */
const AddModel = () => {
  const [inspirationPhotos, setInspirationPhotos] = useState([]);
  const [dallePhotos, setDallePhotos] = useState([]);
  const [modelS3, setModelS3] = useState(null);
  const [uploadedModel, setUploadedModel] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // On submit, insert the data.
  const submit = async () => {
    // inspiration image s3
    const inspirationImage = [];
    inspirationPhotos.forEach((file) => {
      const upload = Images.insert({
        file: file,
        chunkSize: 'dynamic',
      }, false);

      upload.on('start', function () {
      });

      upload.on('end', function (err) {
        if (err) {
          console.log(`Error during upload: ${err}`);
        }
      });

      upload.start();
      // ID needed to store in MongoDB
      inspirationImage.push(upload.config.fileId);
    });

    if (modelBase64 === undefined) {
      return;
    }
    const modelName = document.getElementById('form-modelName').value;
    const cost = document.getElementById('form-estimatedCost').value;

    const cameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const cameraRotation = { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z };

    await Models.collection.insert(
      { name: modelName, owner: Meteor.user().username, base64: modelBase64, cost, modelS3, imageInspiration: inspirationImage, dalleImage: dallePhotos, cameraPosition, cameraRotation },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error');
        }
      },
    );

    const newModel = await Models.collection.findOne({ name: modelName });

    await Discussions.collection.insert(
      { type: 'model', typeID: newModel._id, owner: Meteor.user().username, messages: [], likes: 0, dislikes: 0 },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error');
        } else {
          setShowSubmitModal(false);
          swal('Success', 'Your model has been uploaded!', 'success');
        }
      },
    );
  };

  const animate = () => {
    renderer.state.reset();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    modelBase64 = renderer.domElement.toDataURL();
  };

  const initScene = () => {
    if (scene) return;

    const modelFrame = document.getElementById('modelFrame');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF2F2F2);

    camera = new THREE.PerspectiveCamera(30, modelFrame.clientWidth / modelFrame.clientHeight, 0.1, 10000);
    camera.rotation.y = 25 * (Math.PI / 180);
    camera.position.x = 20;
    camera.position.y = 50;
    camera.position.z = 30;

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

    modelFrame.appendChild(renderer.domElement);
  };

  const handleSubmit = async () => {
    // model S3
    const uploadModel = await Images.insert({
      file: uploadedModel,
      chunkSize: 'dynamic',
    }, false);

    uploadModel.on('start', function () {
    });

    uploadModel.on('end', function (err) {
      if (err) {
        console.log(`Error during upload: ${err}`);
      }
    });

    await uploadModel.start();
    setModelS3(uploadModel.config.fileId);

    setShowSubmitModal(true);
  };

  const loadModel = (file) => {
    setUploadedModel(file);
    const loader = new GLTFLoader();
    const url = URL.createObjectURL(file);
    loader.load(url, function (gltf) {
      const model = gltf.scene;
      model.position.set(0, -25, 0);
      model.scale.set(0.5, 0.5, 0.5);
      scene.add(gltf.scene);
      animate();
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    loadModel(file);
  };

  // eslint-disable-next-line no-unused-vars
  window.addEventListener('resize', function (event) {
    const modelFrame = document.getElementById('modelFrame');
    modelFrame.style.height = `${modelFrame.clientWidth}px`;
    renderer.setSize(modelFrame.clientWidth, modelFrame.clientHeight);
  }, true);

  useEffect(() => {
    initScene();
  });

  return (
    <Container className="py-3 mt-5">
      <h1>New Model</h1>
      <Row sm="1">
        <Col xs lg="6">
          <div id="modelFrame" style={{ border: '1px solid black', aspectRatio: 1, width: '100%' }} />
          <p><b>Adjust the perspective you would like to display your model.</b></p>
          <ul>
            <li>Clicking and dragging with your mouse will rotate the model.</li>
            <li>Holding SHIFT or CTRL while dragging will move the model.</li>
            <li>Scrolling will zoom in and out.</li>
          </ul>
        </Col>
        <Col xs lg="6">
          <Form.Group controlId="formFileLg" className="mb-3">
            <Form.Label style={{ fontSize: 20 }}>Upload 3D Model</Form.Label>
            <Form.Control type="file" size="lg" onChange={handleFileChange} />
            <i>Current supported files: .glb</i>
          </Form.Group>
          <Form.Label style={{ fontSize: 20 }}>Estimated Model Cost</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control id="form-estimatedCost" placeholder="0" type="number" min="0" />
          </InputGroup>
          <hr style={{ color: 'black',
            backgroundColor: 'black',
            height: 2, marginBottom: '10px' }}
          />
          <ImageGenerator inspirationPhotos={inspirationPhotos} setInspirationPhotos={setInspirationPhotos} dallePhotos={dallePhotos} setDallePhotos={setDallePhotos} />
          <Button variant="outline-success" size="lg" onClick={handleSubmit}>Upload Model</Button>
        </Col>
      </Row>
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} style={{ marginTop: '20vh' }}>
        <Modal.Body className="py-5 px-4" style={{ textAlign: 'center' }}>
          <Form.Label style={{ fontSize: 20 }}>Name your Model:</Form.Label>
          <Form.Control id="form-modelName" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={submit}>
            Upload Model
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddModel;
