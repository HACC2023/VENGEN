import { Meteor } from 'meteor/meteor';
import { Users } from '../../api/user/User';
import { Models } from '../../api/model/Model';
import { Simulations } from '../../api/simulation/Simulation';
import { Discussions } from '../../api/discussion/Discussion';
// User-level publication.
// If logged in, then publish documents owned by this user. Otherwise, publish nothing.

// Admin-level publication.
// If logged in and with admin role, then publish all documents from all users. Otherwise, publish nothing.
Meteor.publish(Users.userPublicationName, function () {
  if (this.userId) {
    return Users.collection.find({ _id: this.userId });
  }
  return this.ready();
});

Meteor.publish(Models.userPublicationName, function () {
  if (this.userId) {
    return Models.collection.find();
  }
  return this.ready();
});

// Admin-level publication.
// If logged in and with admin role, then publish all documents from all users. Otherwise, publish nothing.
Meteor.publish(Models.adminPublicationName, function () {
  if (this.userId) {
    return Models.collection.find();
  }
  return this.ready();
});

Meteor.publish(Simulations.userPublicationName, function () {
  if (this.userId) {
    return Simulations.collection.find();
  }
  return this.ready();
});

// Admin-level publication.
// If logged in and with admin role, then publish all documents from all users. Otherwise, publish nothing.
Meteor.publish(Simulations.adminPublicationName, function () {
  if (this.userId) {
    return Simulations.collection.find();
  }
  return this.ready();
});

Meteor.publish(Discussions.userPublicationName, function () {
  if (this.userId) {
    return Discussions.collection.find();
  }
  return this.ready();
});

// Admin-level publication.
// If logged in and with admin role, then publish all documents from all users. Otherwise, publish nothing.
Meteor.publish(Discussions.adminPublicationName, function () {
  if (this.userId) {
    return Discussions.collection.find();
  }
  return this.ready();
});

// alanning:roles publication
// Recommended code to publish roles for each user.
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  return this.ready();
});
