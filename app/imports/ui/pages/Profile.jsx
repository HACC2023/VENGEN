import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import { Col, Container, Row, Image, Tabs, Tab } from 'react-bootstrap';
import { Users } from '../../api/user/User';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import ModelItem from '../components/ModelItem';
import SimulationItem from '../components/SimulationItem';
import LoadingSpinner from '../components/LoadingSpinner';
import TwoFactorAuth from '../components/2FA';

/** Render the user's profile */
const Profile = () => {
  const { likedModels, likedSims, myModels, mySims, ready } = useTracker(() => {
    const subscription = Meteor.subscribe(Users.userPublicationName);
    const modelsSub = Meteor.subscribe(Models.userPublicationName);
    const simSub = Meteor.subscribe(Simulations.userPublicationName);
    const rdy = subscription.ready() && modelsSub.ready() && simSub.ready() && Meteor.user() !== undefined;

    const models = [];
    const sims = [];
    let modelItems = [];
    let simItems = [];

    if (rdy) {
      const usr = Users.collection.findOne({ _id: Meteor.user()._id });

      _.each(usr.likes, (likedModelSim) => {
        const model = Models.collection.findOne({ _id: likedModelSim });
        if (model !== undefined) {
          models.push(model);
        } else {
          const sim = Simulations.collection.findOne({ _id: likedModelSim });
          if (sim !== undefined) {
            sims.push(sim);
          }
        }
      });

      modelItems = Models.collection.find({ owner: Meteor.user().username }).fetch();
      simItems = Simulations.collection.find({ owner: Meteor.user().username }).fetch();
    }

    return {
      likedModels: models,
      likedSims: sims,
      myModels: modelItems,
      mySims: simItems,
      ready: rdy,
    };
  }, []);

  return ready ? (
    <Container className="py-3">
      <Row className="mb-5 align-items-center">
        <Col xs lg="2">
          <Image src="/images/pfp.jpg" thumbnail />
          <TwoFactorAuth />
        </Col>
        <Col>
          <h3>{Users.collection.findOne({ _id: Meteor.user()._id }).username}</h3>
        </Col>
      </Row>
      <Row>
        <Tabs defaultActiveKey="models" className="mb-4">
          <Tab eventKey="models" title="Models">
            <Row>
              <h2>My Models</h2>
              <hr />
            </Row>
            {myModels.length === 0 ? (
            // eslint-disable-next-line react/no-unescaped-entities
              <h4 className="my-3"> You haven't uploaded any models yet. Head to the New Model tab to start. </h4>
            ) : (
              <Row xs={2} md={3} lg={4}>
                {myModels.map((model) => <ModelItem key={model._id} model={model} />)}
              </Row>
            )}
            <Row>
              <h2>Liked Models</h2>
              <hr />
            </Row>
            {likedModels.length === 0 ? (
            // eslint-disable-next-line react/no-unescaped-entities
              <h4 className="my-3"> You haven't liked any models yet. Head to the Gallery tab to start. </h4>
            ) : (
              <Row xs={2} md={3} lg={4}>
                {likedModels.map((model) => <ModelItem key={model._id} model={model} />)}
              </Row>
            )}
          </Tab>
          <Tab eventKey="simulations" title="Simulations">
            <Row>
              <h2>My Simulations</h2>
              <hr />
            </Row>
            {mySims.length === 0 ? (
            // eslint-disable-next-line react/no-unescaped-entities
              <h4 className="my-3"> You haven't made any simulations yet. Head to the Simulation tab to start. </h4>
            ) : (
              <Row xs={2} md={3} lg={4}>
                {mySims.map((sim) => <SimulationItem key={sim._id} sim={sim} />)}
              </Row>
            )}
            <Row>
              <h2>Liked Simulations</h2>
              <hr />
            </Row>
            {likedSims.length === 0 ? (
            // eslint-disable-next-line react/no-unescaped-entities
              <h4 className="my-3"> You haven't liked any simulations yet. Head to the Gallery tab to start. </h4>
            ) : (
              <Row xs={2} md={3} lg={4}>
                {likedSims.map((sim) => <SimulationItem key={sim._id} sim={sim} />)}
              </Row>
            )}
          </Tab>
        </Tabs>
      </Row>
    </Container>
  ) : <LoadingSpinner />;
};

export default Profile;
