import { Meteor } from 'meteor/meteor';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import { Discussions } from '../../api/discussion/Discussion';

/* eslint-disable no-console */

// Initialize the ModelsCollection if empty.
if (Models.collection.find().count() === 0) {
  if (Meteor.settings.defaultModels) {
    console.log('Creating default models.');
    Meteor.settings.defaultModels.forEach(model => Models.collection.insert(model));
  }
}

// Initialize the SimulationsCollection if empty.
if (Simulations.collection.find().count() === 0) {
  if (Meteor.settings.defaultSimulations) {
    console.log('Creating default simulations.');
    Meteor.settings.defaultSimulations.forEach(simulation => Simulations.collection.insert(simulation));
  }
}

// Initialize the DiscussionsCollection if empty.
if (Discussions.collection.find().count() === 0) {
  if (Meteor.settings.defaultDiscussions) {
    console.log('Creating default discussions.');
    Meteor.settings.defaultDiscussions.forEach(discussion => Discussions.collection.insert(discussion));
  }
}
