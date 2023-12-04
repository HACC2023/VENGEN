import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Col, Container, Image, Row, Button, Nav, Card, CardGroup } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { BsCloudUpload, BsImages, BsFillHouseAddFill, BsFillChatLeftTextFill } from 'react-icons/bs';

const Landing = () => {
  const { ready } = useTracker(() => {
    const rdy = Meteor.user() !== undefined;
    return {
      ready: rdy,
    };
  }, []);

  return ready ? (
    <Container id="landing-page" fluid className="py-3">
      <Row style={{ display: 'flex', alignItems: 'center', margin: '0% 5%' }}>
        <Col sm={5}>
          <h2 style={{ fontWeight: 'bold' }}>Facilitating Collaborative Redevelopment of Lahaina</h2>
          <br />
          <p>By fostering collaboration, inclusivity, cultural sensitivity and informed decision-making, Sim-Lahaina aims to expedite the recovery process and build a resilient, sustainable and viable Lahaina community.</p>
          {Meteor.user() === null ? (
            <Nav.Link id="landing-to-signin" as={NavLink} to="/signin" key="landing-to-signin"><Button className="theme-button">Sign In</Button></Nav.Link>
          ) : (
            <Nav.Link id="landing-to-home" as={NavLink} to="/home" key="landing-to-home"><Button className="theme-button">Home Page</Button></Nav.Link>
          )}
        </Col>
        <Col sm={7} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Image src="/images/landing-1.png" className="img-fluid" />
        </Col>
      </Row>
      <br />
      <br />
      <Row style={{ borderTop: '5px solid red', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 53, 0, 0.75)' }} className="px-md-5">
        <Col sm={7} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div>
            <Image src="/images/landing-4.png" className="img-fluid vw-100" style={{ maxWidth: '660px' }} />
          </div>
        </Col>
        <Col sm={4} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'column', textAlign: 'right', color: 'white' }}>
          <h2 style={{ fontWeight: 'bold' }}>Create Your Own Simulation</h2>
          <br />
          <p>Upload either self-designed 3D models or publicly available ones to create your customized 3D simulation for planning the redevelopment of Lahaina, Maui, and manipulate these models on a map.</p>
        </Col>
      </Row>
      <br />
      <br />
      <Row style={{ display: 'flex', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 'bold' }}>How do you get started?</h2>
      </Row>
      <br />
      <Row>
        <CardGroup>
          <Col style={{ padding: '10px' }}>
            <Card style={{ border: '1px solid rgba(255, 53, 0, 0.75)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                <BsCloudUpload style={{ height: '100px', width: '100px' }} />
              </div>
              <Card.Body>
                <Card.Title>1. Upload a Model</Card.Title>
                <Card.Text>
                  Upload a self-designed 3D models. If not, you can use a publicly available ones made from other people (skip to step 3)
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col style={{ padding: '10px' }}>
            <Card style={{ border: '1px solid rgba(255, 53, 0, 0.75)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                <BsImages style={{ height: '100px', width: '100px' }} />
              </div>
              <Card.Body>
                <Card.Title>2. Attached Images to Models</Card.Title>
                <Card.Text>
                  Attach 2d images that illustrate your vision of the model or create them using our built-in AI image generated tool
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col style={{ padding: '10px' }}>
            <Card style={{ border: '1px solid rgba(255, 53, 0, 0.75)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                <BsFillHouseAddFill style={{ height: '100px', width: '100px' }} />
              </div>
              <Card.Body>
                <Card.Title>3. Create a Simulation</Card.Title>
                <Card.Text>
                  Use your self-designed or public 3D models to generate prototype simulations and strategize the redevelopment on a map of Lahaina
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col style={{ padding: '10px' }}>
            <Card style={{ border: '1px solid rgba(255, 53, 0, 0.75)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                <BsFillChatLeftTextFill style={{ height: '100px', width: '100px' }} />
              </div>
              <Card.Body>
                <Card.Title>4. Collaborate</Card.Title>
                <Card.Text>
                  Message through built-in discussions for models, simulations, and threads to collaborate with other community members
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </CardGroup>
      </Row>
      <br />
      <br />
      <Row style={{ borderTop: '5px solid red', padding: '0 5%', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 53, 0, 0.75)', color: 'white' }}>
        <Col sm={5} style={{ flexDirection: 'column' }} className="py-5">
          <h2 style={{ fontWeight: 'bold' }}>Lahaina &quot;Merciless Sun&quot; </h2>
          <br />
          <p>
            The devastating fires in Lahaina, Maui, on August 8th have significantly impacted the local and statewide economy, causing extensive damage that will take years to rebuild,
            while also highlighting significant cultural conflicts involving native culture, art galleries, restaurants, nightclubs, and hotel worker housing.
          </p>
        </Col>
        <Col sm={7} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div>
            <Image src="/images/lahaina.png" width="550px" />
          </div>
        </Col>
      </Row>
    </Container>
  ) : '';
};

export default Landing;
