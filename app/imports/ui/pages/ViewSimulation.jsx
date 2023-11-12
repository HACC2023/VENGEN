import React, { useEffect, useRef } from 'react';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';
import { Col, Row, Button } from 'react-bootstrap';
import { HandThumbsDown, HandThumbsDownFill, HandThumbsUp, HandThumbsUpFill } from 'react-bootstrap-icons';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useParams } from 'react-router';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as mapboxgl from 'mapbox-gl';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users } from '../../api/user/User';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import { Images } from '../../api/images/client/images';
import SimModelItem from '../components/SimModelItem';
import '../../../client/style.css';
import DiscussionPanel from '../components/DicussionPanel';

Meteor.call('getMapboxAPI', (error, result) => {
  // eslint-disable-next-line no-import-assign
  mapboxgl.accessToken = result;
});

let scene;
let camera;
let renderer;

const ViewSimulation = () => {
  const { _id } = useParams();

  const map = useRef(null);
  let sceneTransform;
  let renderFlag = true;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(Infinity, Infinity);

  const loader = new GLTFLoader();

  const { simulation, uniqueModels, ready } = useTracker(() => {
    const subscription = Meteor.subscribe(Simulations.userPublicationName);
    const modelSubscription = Meteor.subscribe(Models.userPublicationName);
    const userSubscription = Meteor.subscribe(Users.userPublicationName);
    const imageSubscription = Meteor.subscribe('images.all');
    const rdy = subscription.ready() && modelSubscription.ready() && imageSubscription.ready() && userSubscription.ready();
    const sim = Simulations.collection.findOne(_id);

    const modelItems = [];
    if (sim !== undefined) {
      const modelIDs = _.uniq(_.pluck(sim.models, 'modelID'));
      // eslint-disable-next-line no-restricted-syntax
      for (const id of modelIDs) {
        const modelItem = Models.collection.findOne({ _id: id });
        modelItems.push(modelItem);
      }
    }

    return {
      simulation: sim,
      uniqueModels: modelItems,
      ready: rdy,
    };
  }, [_id]);

  const centerCoords = { lng: -156.67528434900575, lat: 20.879749734680864 };

  const handleLikeDislike = (likeDislike) => {
    const me = Users.collection.findOne(Meteor.user()._id);
    const likes = me.likes;
    const dislikes = me.dislikes;
    const dislikeIndex = dislikes.indexOf(_id);
    const likeIndex = likes.indexOf(_id);

    if (likeDislike === 'like') {
      if (likeIndex >= 0) {
        likes.splice(likeIndex, 1);
        Simulations.collection.update(_id, { $set: { like: simulation.like - 1 } });
      } else if (dislikeIndex >= 0) {
        dislikes.splice(dislikeIndex, 1);
        likes.push(_id);
        Simulations.collection.update(_id, { $set: { dislike: simulation.dislike - 1, like: simulation.like + 1 } });
      } else {
        likes.push(_id);
        Simulations.collection.update(_id, { $set: { like: simulation.like + 1 } });
      }
    } else if (dislikeIndex >= 0) {
      dislikes.splice(dislikeIndex, 1);
      Simulations.collection.update(_id, { $set: { dislike: simulation.dislike - 1 } });
    } else if (likeIndex >= 0) {
      likes.splice(likeIndex, 1);
      dislikes.push(_id);
      Simulations.collection.update(_id, { $set: { like: simulation.like - 1, dislike: simulation.dislike + 1 } });
    } else {
      dislikes.push(_id);
      Simulations.collection.update(_id, { $set: { dislike: simulation.dislike + 1 } });
    }
    Users.collection.update(me._id, { $set: { likes, dislikes } });
  };

  const onClick = (event) => {
    event.preventDefault();

    const visibility = map.current.getLayoutProperty(
      'simModels',
      'visibility',
    );
    if (visibility !== 'visible') {
      return;
    }

    const modelsWindow = document.getElementById('modelWindow');

    mouse.x = (event.point.x / (window.innerWidth - modelsWindow.clientWidth)) * 2 - 1;
    mouse.y = -(event.point.y / (window.innerHeight - 200)) * 2 + 1;

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
          window.open(`${Meteor.absoluteUrl()}model/${obj.userData.modelID}/`, '_blank');
          break;
        }
        obj = obj.parent;
      }
    }
  };

  const initScene = () => {
    if (!ready || map.current || document.getElementById('map') === null) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: { lng: simulation.mapCenter.lng, lat: simulation.mapCenter.lat },
      zoom: simulation.mapZoom,
      pitch: simulation.mapPitch,
      bearing: simulation.mapBearing,
      antialias: true,
    });

    map.current.on('style.load', () => {
      const mc = mapboxgl.MercatorCoordinate.fromLngLat([centerCoords.lng, centerCoords.lat], 0);
      const meterScale = mc.meterInMercatorCoordinateUnits();

      sceneTransform = {};
      sceneTransform.matrix = new THREE.Matrix4()
        .makeTranslation(mc.x, mc.y, mc.z)
        .scale(new THREE.Vector3(meterScale, -meterScale, meterScale));
      sceneTransform.origin = new THREE.Vector3(mc.x, mc.y, mc.z);

      map.current.addLayer({
        id: 'simModels',
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

          if (ready) {
            // eslint-disable-next-line no-restricted-syntax
            for (const model of simulation.models) {
              const modelItem = Models.collection.findOne({ _id: model.modelID });
              loader.load(
                Images.findOne({ _id: modelItem.modelS3 }).link(),
                // eslint-disable-next-line no-loop-func
                (gltf) => {
                  const gltfscene = gltf.scene;
                  gltfscene.position.set(model.position.x, model.position.y, model.position.z);
                  gltfscene.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
                  gltfscene.scale.set(model.scale.x, model.scale.y, model.scale.z);
                  gltfscene.userData = { modelID: model.modelID };
                  scene.add(gltfscene);
                },
              );
            }
          }

          // use the Mapbox GL JS map canvas for three.js
          renderer = new THREE.WebGLRenderer({
            canvas: thisMap.getCanvas(),
            context: gl,
            antialias: true,
          });

          renderer.autoClear = false;
          if (renderFlag) {
            renderFlag = false;
            renderer.domElement.addEventListener('touchend', onClick, false);
          }
        },

        render: function (gl, matrix) {
          camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(sceneTransform.matrix);
          renderer.state.reset();
          renderer.render(scene, camera);
          map.current.triggerRepaint();
        },
      });

      // Insert the layer beneath any symbol layer.
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout['text-field']).id;
      map.current.addLayer(
        {
          id: 'pastBuildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',

            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.95,
          },
        },
        labelLayerId,
      );

      map.current.on('click', e => {
        onClick(e);
      });

      map.current.style.stylesheet.layers.forEach(layer => {
        if (layer.id === 'poi-label') {
          // How can I execute this only for poi-label which is Restaurant?
          map.current.removeLayer(layer.id);
        }
      });

      // Enumerate ids of the layers.
      const toggleableLayerIds = ['pastBuildings', 'simModels'];
      map.current.setLayoutProperty(toggleableLayerIds[0], 'visibility', 'visible');
      map.current.setLayoutProperty(toggleableLayerIds[1], 'visibility', 'visible');

      // eslint-disable-next-line no-restricted-syntax
      for (const id of toggleableLayerIds) {
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = (id === 'pastBuildings') ? 'Past Buildings' : 'New 3D Models';
        link.className = 'active';

        link.onclick = function (e) {
          const clickedLayer = link.id;
          e.preventDefault();
          e.stopPropagation();

          const visibility = map.current.getLayoutProperty(
            clickedLayer,
            'visibility',
          );

          // Toggle layer visibility by changing the layout object's visibility property.
          if (visibility === 'visible') {
            map.current.setLayoutProperty(clickedLayer, 'visibility', 'none');
            link.className = '';
          } else {
            link.className = 'active';
            map.current.setLayoutProperty(
              clickedLayer,
              'visibility',
              'visible',
            );
          }
        };

        document.getElementById('map-menu').appendChild(link);
      }
    });
  };

  useEffect(() => {
    if (ready) {
      initScene();
    }
  });

  return ready ? (
    <div>
      <Row>
        <Col md={3} id="modelWindow" style={{ overflowY: 'auto', borderRight: 'solid', borderColor: 'grey', borderWidth: 0.5 }}>
          <div style={{ padding: 10 }}>
            <h3 style={{ textAlign: 'center' }}>Models</h3>
            <Row xs={2} md={2} lg={2}>
              {uniqueModels.map((model) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
                <div className="mouse-hover-click" key={model._id} onClick={() => window.open(`${Meteor.absoluteUrl()}model/${model._id}/`, '_blank')}>
                  <SimModelItem model={model} />
                </div>
              ))}
            </Row>
          </div>
        </Col>
        <Col md={9} style={{ padding: 0 }}>
          <nav id="map-menu" />
          <div id="map" style={{ height: window.innerHeight - 200 }} />
        </Col>
      </Row>
      <Row>
        <Col xs lg="3" className="px-3">
          {simulation.cost !== 0 ?
            <h4>Estimated Cost: ${simulation.cost}</h4> :
            <h5>No cost estimations provided</h5>}
          <h4>Number of buildings: {uniqueModels.length}</h4>
        </Col>
        <Col className="my-3">
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
          <span style={{ fontSize: 20, marginRight: 10 }}>{simulation.like}</span>
          {(Users.collection.findOne(Meteor.user()._id).dislikes.indexOf(_id) >= 0) ? (
            <span>
              <HandThumbsDownFill id="thumbs-down-fill" size={30} color="red" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} />
              <HandThumbsDown id="thumbs-down" size={30} color="red" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} hidden />
            </span>
          ) : (
            <span>
              <HandThumbsDownFill id="thumbs-down-fill" size={30} color="red" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} hidden />
              <HandThumbsDown id="thumbs-down" size={30} color="red" className="mouse-hover-click" onClick={() => handleLikeDislike('dislike')} />
            </span>
          )}
          <span style={{ fontSize: 20 }}>{simulation.dislike}</span>
          {(simulation.owner === Meteor.user().username || Roles.userIsInRole(Meteor.user(), ['admin'])) ? (
            <div className="mx-5" style={{ float: 'right' }}>
              <a href={`/editSimulation/${simulation._id}`} style={{ textDecoration: 'none' }}><Button variant="success" size="lg">Edit Simulation</Button></a>
            </div>
          ) : ''}
        </Col>
      </Row>
      <div className="py-5" style={{ borderTop: 'solid', borderColor: 'black', borderWidth: 0.5 }}>
        <DiscussionPanel id={simulation._id} type="simulation" />
      </div>
    </div>
  ) : <LoadingSpinner />;
};

export default ViewSimulation;
