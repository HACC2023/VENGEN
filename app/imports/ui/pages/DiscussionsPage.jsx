import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Row, Tabs, Tab, Form, Col } from 'react-bootstrap';
import { useTracker } from 'meteor/react-meteor-data';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import { Discussions } from '../../api/discussion/Discussion';
import LoadingSpinner from '../components/LoadingSpinner';
import ModelDiscussionItem from '../components/ModelDiscussionItem';
import ThreadDiscussionItem from '../components/ThreadDiscussionItem';
import ThreadModal from '../components/ThreadModal';
import SimulationDiscussionItem from '../components/SimulationDiscussionItem';
import SearchBar from '../components/SearchBar';

const DiscussionsPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [query, setQuery] = useState('');
  const [modelResult, setModelResult] = useState([]);
  const [simResult, setSimResult] = useState([]);
  const [threadResult, setThreadResult] = useState([]);
  const [activeKey, setActiveKey] = useState('models');

  const { ready, models, simulations, threads } = useTracker(() => {
    const subscription = Meteor.subscribe(Models.userPublicationName);
    const simSubscription = Meteor.subscribe(Simulations.userPublicationName);
    const discSubscription = Meteor.subscribe(Discussions.userPublicationName);

    const rdy = subscription.ready() && simSubscription.ready() && discSubscription.ready();

    const modelItems = Models.collection.find({ show: true }).fetch();
    const simItems = Simulations.collection.find({}).fetch();
    const threadItems = Discussions.collection.find({ type: 'thread' }).fetch();

    return {
      models: modelItems,
      simulations: simItems,
      ready: rdy,
      threads: threadItems,
    };
  }, []);

  const changeTab = (k) => {
    setQuery('');
    setActiveKey(k);
    setModelResult(models);
    setSimResult(simulations);
    setThreadResult(threads);
  };

  useEffect(() => {
    setModelResult(models);
    setSimResult(simulations);
    setThreadResult(threads);
  }, [models, simulations, threads]);

  const sortFunc = (e) => {
    setQuery('');
    switch (e) {
    case 'top':
      setModelResult([...models].sort((a, b) => b.like - a.like));
      setSimResult([...simulations].sort((a, b) => b.like - a.like));
      setThreadResult([...threads].sort((a, b) => b.likes - a.likes));
      break;
    case 'bottom':
      setModelResult([...models].sort((a, b) => b.dislike - a.dislike));
      setSimResult([...simulations].sort((a, b) => b.dislike - a.dislike));
      setThreadResult([...threads].sort((a, b) => b.dislikes - a.dislikes));
      break;
    default:
    }
  };

  const handleSearch = (search) => {
    const searchInput = search.trim();
    switch (activeKey) {
    case 'models':
      setModelResult(models.filter(model => (model.name.toLowerCase().includes(searchInput.toLowerCase()))));
      break;
    case 'simulations':
      setSimResult(simulations.filter(sim => (sim.name.toLowerCase().includes(searchInput.toLowerCase()))));
      break;
    case 'threads':
      setThreadResult(threads.filter((thread) => (thread.title.toLowerCase().includes(searchInput.toLowerCase()))));
      break;
    default:
    }
  };

  return (ready ? (
    <Container className="py-3">
      <Row className="d-flex justify-content-center mb-3">
        <Col>
          <SearchBar handleSearch={handleSearch} />
        </Col>

        <Col>
          <Form.Select onChange={(e) => sortFunc(e.target.value)}>
            <option value="null">Sort By</option>
            <option value="top">Top Comments</option>
            <option value="bottom">Bottom Comments</option>
          </Form.Select>
        </Col>

        <Col className="d-flex justify-content-end">
          <ThreadModal />
        </Col>
      </Row>
      <Tabs
        activeKey={activeKey}
        onSelect={(k) => changeTab(k)}
        id="fill-tab-example"
        className="mb-4"
        fill
      >
        <Tab eventKey="models" title="Models">
          {modelResult?.length > 0 ? (
            <div>
              {modelResult.map((item, idx) => <ModelDiscussionItem item={item} key={idx} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h4>No discussions found</h4>
              <p>To start a discussion, go to the gallery page and click on a <b>model</b> to start a new discussion</p>
            </div>
          )}
        </Tab>
        <Tab eventKey="simulations" title="Simulations">
          {simResult?.length > 0 ? (
            <div>
              {simResult.map((item, idx) => <SimulationDiscussionItem item={item} key={idx} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h4>No discussions found</h4>
              <p>To start a discussion, go to the gallery page and click on a <b>simulation</b> to start a new discussion</p>
            </div>
          )}
        </Tab>
        <Tab eventKey="threads" title="Threads">
          {threadResult?.length > 0 ? (
            <div>
              {threadResult.map((item, idx) => <ThreadDiscussionItem item={item} key={idx} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h4>No threads found</h4>
              <p>To start a thread, click the green <b>New Thread</b> button</p>
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  ) : <LoadingSpinner />);
};

export default DiscussionsPage;
