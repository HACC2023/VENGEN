import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const xyzType = new SimpleSchema({
  x: Number,
  y: Number,
  z: Number,
});

class ModelsCollection {
  constructor() {
    // The name of this collection.
    this.name = 'ModelsCollection';
    // Define the Mongo collection.
    this.collection = new Mongo.Collection(this.name);
    // Define the structure of each document in the collection.
    this.schema = new SimpleSchema({
      owner: String,
      name: String,
      base64: String,
      cameraPosition: xyzType,
      cameraRotation: xyzType,
      like: { type: Number, defaultValue: 0 },
      dislike: { type: Number, defaultValue: 0 },
      cost: { type: Number, optional: true },
      imageInspiration: { type: Array, optional: true, defaultValue: [] },
      'imageInspiration.$': String,
      dalleImage: { type: Array, optional: true, defaultValue: [] },
      'dalleImage.$': String,
      modelS3: String,
      show: { type: Boolean, defaultValue: true },
    });
    // Attach the schema to the collection, so all attempts to insert a document are checked against schema.
    this.collection.attachSchema(this.schema);
    // Define names for publications and subscriptions
    this.userPublicationName = `${this.name}.publication.user`;
    this.adminPublicationName = `${this.name}.publication.admin`;
  }
}
export const Models = new ModelsCollection();
