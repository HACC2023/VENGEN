import React, { useRef, useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import { Button, Row, Col, InputGroup, Form, Container, Spinner, Modal } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import * as mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import swal from 'sweetalert';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import LoadingSpinner from '../components/LoadingSpinner';
import SimModelItem from '../components/SimModelItem';
import PlaceForm from '../components/PlaceForm';
import { Discussions } from '../../api/discussion/Discussion';
import { Images } from '../../api/images/client/images';
import '../../../client/style.css';

Meteor.call('getMapboxAPI', (error, result) => {
  // eslint-disable-next-line no-import-assign
  mapboxgl.accessToken = result;
});

let selectedModel = null;
let selectedModelFile = null;
const savedModelVals = {
  position: { x: 0, y: 0, z: 0 },
  rotationY: 0,
  scale: { x: 0, y: 0, z: 0 },
};

let scene;
let camera;
let renderer;
let base64;

const AddSim = () => {
  const [showModel, setShowModel] = useState(false);
  const handleClose = () => setShowModel(false);
  const handleShow = () => setShowModel(true);

  const { ready, models } = useTracker(() => {
    const subscription = Meteor.subscribe(Models.userPublicationName);
    const simSubscription = Meteor.subscribe(Simulations.userPublicationName);
    const imageSubscription = Meteor.subscribe('images.all');
    const rdy = subscription.ready() && simSubscription.ready() && imageSubscription.ready();
    const modelItems = Models.collection.find({ show: true }).fetch();
    return {
      models: modelItems,
      ready: rdy,
    };
  }, []);

  const [searchField, setSearchField] = useState('');

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [placesSearch, setPlacesSearch] = useState(null);
  const map = useRef(null);
  const centerCoords = { lng: -156.67528434900575, lat: 20.879749734680864 };
  const zoom = 15.4;
  const pitch = 64.9;
  const bearing = 72.5;

  let sceneTransform;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(Infinity, Infinity);

  const loader = new GLTFLoader();

  let translateTimer;

  const selectModel = (model) => {
    selectedModelFile = model;
    setShowModel(false);
    document.getElementById('selected-model-name').innerHTML = model.name;
  };

  const degToRad = (degrees) => degrees * (Math.PI / 180);

  const showEditDiv = () => {
    if (selectedModel === null) return;
    savedModelVals.position = { x: selectedModel.position.x, y: selectedModel.position.y, z: selectedModel.position.z };
    savedModelVals.rotationY = selectedModel.rotation.y;
    savedModelVals.scale = { x: selectedModel.scale.x, y: selectedModel.scale.y, z: selectedModel.scale.z };
    document.getElementById('form-scale').value = selectedModel.scale.x;
    document.getElementById('coords-x-val').value = selectedModel.position.x;
    document.getElementById('coords-y-val').value = selectedModel.position.y;
    document.getElementById('edit-show').hidden = false;
    document.getElementById('edit-none').hidden = true;
  };

  const hideEditDiv = () => {
    document.getElementById('edit-show').hidden = true;
    document.getElementById('edit-none').hidden = false;
    selectedModel = null;
  };

  const updateRotation = (val) => {
    if (selectedModel === null) return;
    let degree = 360 * (val / 100);
    if (degree > 180) degree -= 360;
    selectedModel.rotation.y = degToRad(degree);
    selectedModel.userData.rotation.y = selectedModel.rotation.y;
  };

  const updateScale = (val) => {
    if (selectedModel === null || val <= 0) return;
    selectedModel.scale.set(val, val, val);
    selectedModel.userData.scale.x = selectedModel.scale.x;
    selectedModel.userData.scale.y = selectedModel.scale.y;
    selectedModel.userData.scale.z = selectedModel.scale.z;
  };

  const setXY = () => {
    if (selectedModel === null) return;

    selectedModel.position.x = document.getElementById('coords-x-val').value;
    selectedModel.position.y = document.getElementById('coords-y-val').value;
    selectedModel.userData.position.x = selectedModel.position.x;
    selectedModel.userData.position.y = selectedModel.position.y;
    selectedModel.userData.position.z = selectedModel.position.z;
  };

  const startTranslate = (pos) => {
    if (selectedModel === null) return;

    if (pos === 'negX') selectedModel.position.x = +selectedModel.position.x - +3;
    else if (pos === 'posX') selectedModel.position.x = +selectedModel.position.x + +3;
    else if (pos === 'negY') selectedModel.position.y = +selectedModel.position.y - +3;
    else if (pos === 'posY') selectedModel.position.y = +selectedModel.position.y + +3;

    selectedModel.userData.position.x = selectedModel.position.x;
    selectedModel.userData.position.y = selectedModel.position.y;
    selectedModel.userData.position.z = selectedModel.position.z;
    document.getElementById('coords-x-val').value = selectedModel.position.x;
    document.getElementById('coords-y-val').value = selectedModel.position.y;

    translateTimer = setInterval(function () {
      if (pos === 'negX') selectedModel.position.x = +selectedModel.position.x - +3;
      else if (pos === 'posX') selectedModel.position.x = +selectedModel.position.x + +3;
      else if (pos === 'negY') selectedModel.position.y = +selectedModel.position.y - +3;
      else if (pos === 'posY') selectedModel.position.y = +selectedModel.position.y + +3;

      selectedModel.userData.position.x = selectedModel.position.x;
      selectedModel.userData.position.y = selectedModel.position.y;
      selectedModel.userData.position.z = selectedModel.position.z;
      document.getElementById('coords-x-val').value = selectedModel.position.x;
      document.getElementById('coords-y-val').value = selectedModel.position.y;
    }, 100);

  };

  const endTranslate = () => {
    clearInterval(translateTimer);
  };

  const deleteModel = () => {
    if (selectedModel === null) return;
    scene.remove(selectedModel);
    hideEditDiv();
  };

  const cancelEditModel = () => {
    selectedModel.position.set(savedModelVals.position.x, savedModelVals.position.y, savedModelVals.position.z);
    selectedModel.rotation.y = savedModelVals.rotationY;
    selectedModel.scale.set(savedModelVals.scale.x, savedModelVals.scale.y, savedModelVals.scale.z);
    hideEditDiv();
  };

  const saveEditModel = () => {
    // TODO
    hideEditDiv();
  };

  const saveSimulation = () => {
    if (scene.children.length <= 2) {
      swal('No Models Found', 'There must be at least one model in the simulation.', 'error');
      return;
    }

    document.getElementById('loading-spinner').hidden = false;

    const modelsToUpload = [];
    let totalCost = 0;
    for (let i = 2; i < scene.children.length; i++) {
      const thisModelData = scene.children[i].userData;
      modelsToUpload.push({
        modelID: thisModelData.modelID,
        coords: { lng: thisModelData.coords.lng, lat: thisModelData.coords.lat },
        position: { x: thisModelData.position.x, y: thisModelData.position.y, z: thisModelData.position.z },
        rotation: { x: thisModelData.rotation.x, y: thisModelData.rotation.y, z: thisModelData.rotation.z },
        scale: { x: thisModelData.scale.x, y: thisModelData.scale.y, z: thisModelData.scale.z },
      });
      totalCost += thisModelData.cost;
    }
    base64 = map.current.getCanvas().toDataURL();

    const mapCenter = { lng: map.current.getCenter().lng, lat: map.current.getCenter().lat };
    const mapBearing = map.current.getBearing();
    const mapZoom = map.current.getZoom();
    const mapPitch = map.current.getPitch();

    const simName = document.getElementById('form-simName').value;

    Simulations.collection.insert(
      { owner: Meteor.user().username, name: simName, base64: base64, cost: totalCost, models: modelsToUpload, mapCenter, mapBearing, mapZoom, mapPitch },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error');
        } else {
          setShowSubmitModal(false);
          swal('Success', 'Your simulation has been uploaded!', 'success');
        }
        document.getElementById('loading-spinner').hidden = true;
      },
    );

    const newSim = Simulations.collection.findOne({ base64: base64 });

    Discussions.collection.insert(
      { type: 'simulation', typeID: newSim._id, owner: Meteor.user().username, messages: [], likes: 0, dislikes: 0 },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error');
        }
      },
    );
  };

  function onClick(event) {
    event.preventDefault();

    const editWindow = document.getElementById('edit-window');

    mouse.x = (event.point.x / (window.innerWidth - editWindow.clientWidth)) * 2 - 1;
    mouse.y = -(event.point.y / (window.innerHeight - 50)) * 2 + 1;

    const camInverseProjection = new THREE.Matrix4();
    camInverseProjection.copy(camera.projectionMatrix).invert();
    const cameraPosition = new THREE.Vector3().applyMatrix4(camInverseProjection);
    const mousePosition = new THREE.Vector3(mouse.x, mouse.y, 1).applyMatrix4(camInverseProjection);
    const viewDirection = mousePosition.clone().sub(cameraPosition).normalize();

    raycaster.set(cameraPosition, viewDirection);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent != null) {
        if (obj.parent.uuid === scene.uuid) {
          selectedModel = obj;
          showEditDiv();
          break;
        }
        obj = obj.parent;
      }
    } else {
      if (!selectedModelFile) return;

      const coordinates = event.lngLat;

      const model = {
        obj: Images.findOne({ _id: selectedModelFile.modelS3 }).link(),
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 90, y: -90, z: 0 },
      };

      const modelOrigin3 = [coordinates.lng, coordinates.lat];
      const modelAltitude3 = 0;
      const modelRotate3 = new THREE.Euler(degToRad(model.rotation.x), degToRad(model.rotation.y), degToRad(model.rotation.z), 'XYZ');

      const mc = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin3, modelAltitude3);
      const meterScale = mc.meterInMercatorCoordinateUnits();
      loader.load(
        model.obj,
        function (gltf) {
          const gltfscene = gltf.scene;
          const origin = sceneTransform.origin;
          gltfscene.position.set((mc.x - origin.x) / meterScale, -(mc.y - origin.y) / meterScale, (mc.z - origin.z) / meterScale);
          gltfscene.quaternion.setFromEuler(modelRotate3);
          gltfscene.scale.set(model.scale.x, model.scale.y, model.scale.z);
          gltfscene.userData = {
            modelID: selectedModelFile._id,
            coords: { lng: coordinates.lng, lat: coordinates.lat },
            position: { x: gltfscene.position.x, y: gltfscene.position.y, z: gltfscene.position.z },
            rotation: { x: gltfscene.rotation.x, y: gltfscene.rotation.y, z: gltfscene.rotation.z },
            scale: { x: gltfscene.scale.x, y: gltfscene.scale.y, z: gltfscene.scale.z },
            cost: (selectedModelFile.cost !== undefined) ? selectedModelFile.cost : 0,
          };
          scene.add(gltfscene);
          selectedModel = gltfscene;
          showEditDiv();
        },
      );
    }
  }

  useEffect(() => {

    if (!ready || map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: centerCoords,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      preserveDrawingBuffer: true,
      antialias: true,
    });

    map.current.on('load', () => {
      const mc = mapboxgl.MercatorCoordinate.fromLngLat([centerCoords.lng, centerCoords.lat], 0);
      const meterScale = mc.meterInMercatorCoordinateUnits();

      sceneTransform = {};
      sceneTransform.matrix = new THREE.Matrix4()
        .makeTranslation(mc.x, mc.y, mc.z)
        .scale(new THREE.Vector3(meterScale, -meterScale, meterScale));
      sceneTransform.origin = new THREE.Vector3(mc.x, mc.y, mc.z);

      map.current.addLayer({
        id: 'custom-threebox-model',
        type: 'custom',
        renderingMode: '3d',

        onAdd: function (thisMap, gl) {
          camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
          scene = new THREE.Scene();

          const light1 = new THREE.AmbientLight(0xffffff);
          light1.position.set(0, -70, 100).normalize();
          scene.add(light1);

          const light2 = new THREE.AmbientLight(0xffffff);
          light2.position.set(0, 70, 100).normalize();
          scene.add(light2);

          // use the Mapbox GL JS map canvas for three.js
          renderer = new THREE.WebGLRenderer({
            canvas: thisMap.getCanvas(),
            context: gl,
            antialias: true,
          });

          renderer.autoClear = false;
        },

        render: function (gl, matrix) {
          camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(sceneTransform.matrix);
          renderer.state.reset();
          renderer.render(scene, camera);
          map.current.triggerRepaint();
        },
      });

      map.current.on('click', e => {
        onClick(e);
      });

      map.current.style.stylesheet.layers.forEach(layer => {
        if (layer.id === 'poi-label') {
          map.current.removeLayer(layer.id);
        }
      });
    });
  });

  const jumpToMap = (loc) => {
    if (loc === null) return;

    map.current.flyTo({
      center: [loc.lng, loc.lat],
      zoom: zoom,
      bearing: bearing,
      pitch: pitch,
    });
  };

  const Search = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const filter = document.getElementById('model-search').value;
      setSearchField(filter.toLowerCase());
    }
  };

  const filterModels = () => _.filter(models, (model) => {
    if (searchField === '') {
      return models;
    }
    if (model.owner.toLowerCase().indexOf(searchField) >= 0) {
      return true;
    }
    return model.name.toLowerCase().indexOf(searchField) >= 0;
  });

  return (ready ? (
    <div>
      <Row>
        <Col>
          <div id="map" style={{ height: window.innerHeight - 50 }} />
        </Col>
        <Col xs lg="2" className="pt-3" id="edit-window" style={{ height: window.innerHeight - 50, paddingRight: 20 }}>
          <Row className="mb-3">
            <h3>Navigate to Address:</h3>
            <PlaceForm setPlacesSearch={setPlacesSearch} />
            <Container>
              <Button variant="primary" size="sm" onClick={() => jumpToMap(placesSearch)} className="theme-button" style={{ width: '3em' }}>Go</Button>
            </Container>
          </Row>
          <Row>
            <h3>Currently Selected Model:</h3>
            <p id="selected-model-name" style={{ color: '#f8744d' }}>None</p>
            <p><Button className="theme-button" onClick={handleShow}>View Models</Button></p>
          </Row>
          <Row>
            <h3>Edit Model</h3>
            <div id="edit-none">
              <p>Select a model to begin editing. If there are no models, click anywhere on the map to add a model.</p>
              <p>When uploading the simulation, the current camera angle you see will be used as the starting view upon loading the simulation.</p>
              <Button variant="success" onClick={() => setShowSubmitModal(true)}>Upload Simulation</Button>
            </div>
            <div id="edit-show" hidden>
              <Form.Label>Rotation</Form.Label>
              <Form.Range id="form-rotation" onChange={e => updateRotation(e.target.value)} />
              <Form.Label>Scale</Form.Label>
              <Form.Control id="form-scale" type="number" min="0" onChange={e => updateScale(e.target.value)} defaultValue="1" />

              <br />
              <Form.Label>X: </Form.Label>
              <InputGroup>
                <Button onMouseDown={() => startTranslate('negX')} onMouseUp={endTranslate}><ChevronLeft /></Button>
                <Button onMouseDown={() => startTranslate('posX')} onMouseUp={endTranslate}><ChevronRight /></Button>
                <Form.Control id="coords-x-val" onChange={() => setXY()} />
              </InputGroup>
              <br />
              <Form.Label>Y: </Form.Label>
              <InputGroup>
                <Button onMouseDown={() => startTranslate('negY')} onMouseUp={endTranslate}><ChevronLeft /></Button>
                <Button onMouseDown={() => startTranslate('posY')} onMouseUp={endTranslate}><ChevronRight /></Button>
                <Form.Control id="coords-y-val" onChange={() => setXY()} />
              </InputGroup>
              <br /><br /><br /><br /><br />

              <Button variant="danger" onClick={deleteModel}>Delete</Button>{' '}
              <Button variant="secondary" onClick={cancelEditModel}>Cancel</Button>{' '}
              <Button variant="success" onClick={saveEditModel}>Save</Button>
            </div>
          </Row>
        </Col>
      </Row>
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} style={{ marginTop: '20vh' }}>
        <Modal.Body className="py-5 px-4" style={{ textAlign: 'center' }}>
          <Form.Label style={{ fontSize: 20 }}>Name your Simulation:</Form.Label>
          <Form.Control id="form-simName" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveSimulation}>
            Upload Simulation
          </Button>
          <Spinner id="loading-spinner" animation="border" variant="info" size="lg" style={{ marginLeft: '1em' }} hidden />
        </Modal.Footer>
      </Modal>
      <Modal show={showModel} onHide={handleClose} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>3D Models</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="my-5 mx-5">
            <InputGroup className="mb-3">
              <Form.Control
                id="model-search"
                placeholder="Search ..."
                aria-label="Search ..."
                onKeyUp={e => Search(e)}
              />
              <Button variant="primary" className="theme-button" onClick={e => Search(e)}>
                Search
              </Button>
            </InputGroup>
            <Row xs={2} sm={4} md={6} lg={8}>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
              {filterModels().map((model) => <div className="mouse-hover-click" onClick={() => selectModel(model)} key={model._id}><SimModelItem model={model} /></div>)}
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  ) : <LoadingSpinner />);
};

export default AddSim;
