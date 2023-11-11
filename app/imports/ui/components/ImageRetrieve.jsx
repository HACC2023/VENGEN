import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Container, Row, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Images } from '../../api/images/client/images';
import { Models } from '../../api/model/ Model';

const ImageRetrieve = () => {
  // Retrieve Image
  const { ready, models } = useTracker(() => {
    const imageSubscription = Meteor.subscribe('images.all');
    const modelSubscription = Meteor.subscribe(Models.userPublicationName);
    const rdy = imageSubscription.ready() && modelSubscription;
    const modelCollection = Models.collection.find({}).fetch();
    return {
      models: modelCollection,
      ready: rdy,
    };
  });

  const loadModel = () => {
    console.log(models[1].modelS3);
    const uploadImage = models[1].modelS3;
    console.log(uploadImage);
    if (ready) {
      const s3Link = Images.findOne({ _id: uploadImage });
      console.log(s3Link.link());
      const s3Image = s3Link.link();
      console.log(s3Image);
    }
  };

  return (
    <Container id="landing-page" fluid className="py-3">
      <Row>
        <Button onClick={() => loadModel()}>load</Button>
      </Row>
    </Container>
  );
};

export default ImageRetrieve;
