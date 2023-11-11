import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const latLngType = new SimpleSchema({
  lng: Number,
  lat: Number,
});

const xyzType = new SimpleSchema({
  x: Number,
  y: Number,
  z: Number,
});

const modelType = new SimpleSchema(
  {
    modelID: String,
    coords: latLngType,
    position: xyzType,
    rotation: xyzType,
    scale: xyzType,
  },
);

class SimulationsCollection {
  constructor() {
    // The name of this collection.
    this.name = 'SimulationsCollection';
    // Define the Mongo collection.
    this.collection = new Mongo.Collection(this.name);
    // Define the structure of each document in the collection.
    this.schema = new SimpleSchema({
      owner: String,
      name: String,
      base64: String,
      like: { type: Number, defaultValue: 0 },
      dislike: { type: Number, defaultValue: 0 },
      cost: { type: Number, optional: true },
      models: { type: Array },
      'models.$': modelType,
      mapCenter: latLngType,
      mapBearing: Number,
      mapZoom: Number,
      mapPitch: Number,
    });
    // Attach the schema to the collection, so all attempts to insert a document are checked against schema.
    this.collection.attachSchema(this.schema);
    // Define names for publications and subscriptions
    this.userPublicationName = `${this.name}.publication.user`;
    this.adminPublicationName = `${this.name}.publication.admin`;
  }
}
export const Simulations = new SimulationsCollection();
