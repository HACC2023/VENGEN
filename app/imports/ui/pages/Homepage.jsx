import React, { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import { Col, Container, Row, Carousel } from 'react-bootstrap';
import { Models } from '../../api/model/Model';
import { Discussions } from '../../api/discussion/Discussion';
import { Simulations } from '../../api/simulation/Simulation';
import LoadingSpinner from '../components/LoadingSpinner';
import HomeModelItem from '../components/HomeModelItem';
import HomeThreadItem from '../components/HomeThreadItem';
import CarouselSimulationItem from '../components/CarouselSimulationItem';

const Homepage = () => {
  const { ready, models, threads, simulations } = useTracker(() => {
    const subscription = Meteor.subscribe(Models.userPublicationName);
    const discussionSub = Meteor.subscribe(Discussions.userPublicationName);
    const simSub = Meteor.subscribe(Simulations.userPublicationName);
    const rdy = subscription.ready() && discussionSub.ready() && simSub.ready();
    const modelItems = Models.collection.find({ show: true }).fetch();
    const threadItems = Discussions.collection.find({ type: 'thread' }).fetch();
    const simItems = Simulations.collection.find({}).fetch();

    return {
      models: modelItems,
      threads: threadItems,
      simulations: simItems,
      ready: rdy,
    };
  }, []);

  let filteredModels = [];
  let filteredThreads = [];
  let filteredSimulations = [];

  if (ready) {
    filteredModels = _.sortBy(models, (model) => {
      if (model.like + model.dislike === 0) {
        return 0;
      }
      if (model.like === 0 && model.dislike > 0) {
        return -1;
      }
      if (model.dislike === 0) {
        return model.like;
      }
      return model.like / (model.like + model.dislike);
    }).reverse().slice(0, 7);

    filteredThreads = _.sortBy(threads, (thread) => {
      if (thread.likes + thread.dislikes === 0) {
        return 0;
      }
      if (thread.likes === 0 && thread.dislikes > 0) {
        return -1;
      }
      if (thread.dislike === 0) {
        return thread.like;
      }
      return thread.likes / (thread.likes + thread.dislikes);
    }).reverse().slice(0, 7);

    filteredSimulations = _.sortBy(simulations, (sim) => {
      if (sim.like + sim.dislike === 0) {
        return 0;
      }
      if (sim.like === 0 && sim.dislike > 0) {
        return -1;
      }
      if (sim.dislike === 0) {
        return sim.like;
      }
      return sim.like / (sim.like + sim.dislike);
    }).reverse().slice(0, 9);
  }

  const adjustToSmallestHeight = () => {
    const simCards = document.getElementsByClassName('sim-card-item');
    if (simCards.length === 0) {
      return;
    }
    let smallestHeight = 999999;

    [].forEach.call(simCards, (sim) => {
      if (sim.clientHeight > 0 && sim.clientHeight < smallestHeight) {
        smallestHeight = sim.clientHeight;
      }
    });

    [].forEach.call(simCards, (sim) => {
      // eslint-disable-next-line no-param-reassign
      sim.style.height = `${smallestHeight}px`;
    });
  };

  useEffect(() => {
    adjustToSmallestHeight();
  });

  return ready ? (
    <div id="landing-page" className="py-3 align-items-center text-center min-vh-100 orange-white-gradient">
      <div className="d-flex flex-column justify-content-center" style={{ color: '#FF8100', marginLeft: '8vw', marginRight: '8vw' }}>
        <Row className="mb-5">
          <h1 className="display-1 fw-bold">Welcome to LahainaSim</h1>
        </Row>
        <Row>
          <Container className="shadow-lg p-3 mb-5 bg-white rounded">
            <h1>Featured Simulations</h1>
            <Carousel id="featured-sim-carousel" style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}>
              {filteredSimulations.length > 0 ? (
                <Carousel.Item>
                  <CarouselSimulationItem simulations={filteredSimulations.slice(0, 3)} />
                </Carousel.Item>
              ) : ''}
              {filteredSimulations.length > 3 ? (
                <Carousel.Item>
                  <CarouselSimulationItem simulations={filteredSimulations.slice(3, 6)} />
                </Carousel.Item>
              ) : ''}
              {filteredSimulations.length > 6 ? (
                <Carousel.Item>
                  <CarouselSimulationItem simulations={filteredSimulations.slice(6, 9)} />
                </Carousel.Item>
              ) : ''}
            </Carousel>
          </Container>
        </Row>
        <Row xs={1} md={2}>
          <Col md={4}>
            <h1 className="align-items-left">Popular Models</h1>
            <Container id="landing-column-models" className="shadow-lg p-3 pb-5 mb-5 bg-white rounded">
              {filteredModels.map((model) => <HomeModelItem key={model._id} model={model} />)}
              <div style={{ float: 'right' }}>
                <a href="/gallery">View all Models...</a>
              </div>
            </Container>
          </Col>
          <Col md={8}>
            <h1 className="align-items-left">Top Threads</h1>
            <Container id="landing-column-discussions" className="shadow-lg p-3 pb-5 mb-5 bg-white rounded">
              {filteredThreads.map((thread) => <HomeThreadItem key={thread._id} thread={thread} />)}
              <div style={{ float: 'right' }}>
                <a href="/Discussions">View all Threads...</a>
              </div>
            </Container>
          </Col>
        </Row>
      </div>
    </div>
  ) : <LoadingSpinner />;
};

export default Homepage;
