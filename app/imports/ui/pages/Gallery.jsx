import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Container, Row, Tabs, Tab, Form, Button, InputGroup } from 'react-bootstrap';
import { useTracker } from 'meteor/react-meteor-data';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import ModelItem from '../components/ModelItem';
import SimulationItem from '../components/SimulationItem';
import LoadingSpinner from '../components/LoadingSpinner';

const Gallery = () => {
  const { ready, models, simulations } = useTracker(() => {
    const subscription = Meteor.subscribe(Models.userPublicationName);
    const simSubscription = Meteor.subscribe(Simulations.userPublicationName);
    const rdy = subscription.ready() && simSubscription.ready();
    const modelItems = Models.collection.find({ show: true }).fetch();
    const simItems = Simulations.collection.find({}).fetch();
    return {
      models: modelItems,
      simulations: simItems,
      ready: rdy,
    };
  }, []);

  const [searchFieldModel, setSearchFieldModel] = useState('');
  const [searchFieldSim, setSearchFieldSim] = useState('');

  const Search = (e, type) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (type === 'model') {
        const filter = document.getElementById('model-search').value;
        setSearchFieldModel(filter.toLowerCase());
      } else {
        const filter = document.getElementById('sim-search').value;
        setSearchFieldSim(filter.toLowerCase());
      }
    }
  };

  const filterModels = () => _.filter(models, (model) => {
    if (searchFieldModel === '') {
      return models;
    }
    if (model.owner.toLowerCase().indexOf(searchFieldModel) >= 0) {
      return true;
    }
    return model.name.toLowerCase().indexOf(searchFieldModel) >= 0;
  });

  const filterSims = () => _.filter(simulations, (sim) => {
    if (searchFieldSim === '') {
      return simulations;
    }
    if (sim.owner.toLowerCase().indexOf(searchFieldSim) >= 0) {
      return true;
    }
    return sim.name.toLowerCase().indexOf(searchFieldSim) >= 0;
  });

  return (ready ? (
    <Container className="py-3">
      <Tabs defaultActiveKey="models" className="mb-3">
        <Tab eventKey="models" title="Models">
          <InputGroup className="mb-3">
            <Form.Control
              id="model-search"
              placeholder="Search ..."
              aria-label="Search ..."
              onKeyUp={e => Search(e, 'model')}
            />
            <Button variant="primary" className="theme-button" onClick={e => Search(e, 'model')}>
              Search
            </Button>
          </InputGroup>
          <Row xs={2} md={3} lg={4}>
            {filterModels().map((model) => <ModelItem key={model._id} model={model} />)}
          </Row>
        </Tab>
        <Tab eventKey="simulations" title="Simulations">
          <InputGroup>
            <Form.Control
              id="sim-search"
              placeholder="Search ..."
              aria-label="Search ..."
              onKeyUp={e => Search(e, 'sim')}
            />
            <Button variant="primary" className="theme-button" onClick={e => Search(e, 'sim')}>
              Search
            </Button>
          </InputGroup>
          <Row xs={2} md={3} lg={4}>
            {filterSims().map((sim) => <SimulationItem key={sim._id} sim={sim} />)}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  ) : <LoadingSpinner />);
};

export default Gallery;
