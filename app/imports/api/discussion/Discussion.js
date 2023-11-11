import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const messageType = new SimpleSchema(
  {
    id: Number,
    user: String,
    message: String,
    time: Date,
    likes: Number,
    dislikes: Number,
  },
);

class DiscussionsCollection {
  constructor() {
    // The name of this collection.
    this.name = 'DiscussionsCollection';
    // Define the Mongo collection.
    this.collection = new Mongo.Collection(this.name);
    // Define the structure of each document in the collection.
    this.schema = new SimpleSchema({
      type: {
        type: String,
        allowedValues: ['model', 'simulation', 'thread'],
        defaultValue: 'thread',
      },
      typeID: { type: String, optional: true, defaultValue: undefined },
      owner: String,
      title: { type: String, optional: true },
      messages: { type: Array },
      likes: Number,
      dislikes: Number,
      'messages.$': messageType,
    });
    // Attach the schema to the collection, so all attempts to insert a document are checked against schema.
    this.collection.attachSchema(this.schema);
    // Define names for publications and subscriptions
    this.userPublicationName = `${this.name}.publication.user`;
    this.adminPublicationName = `${this.name}.publication.admin`;
  }
}
export const Discussions = new DiscussionsCollection();
