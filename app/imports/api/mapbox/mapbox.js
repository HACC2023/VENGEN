import { Meteor } from 'meteor/meteor';

if (process.env.Mapbox) {
  Meteor.settings.mapbox = JSON.parse(process.env.Mapbox).mapbox;
}

const mapboxConf = Meteor.settings.mapbox || {};

if (mapboxConf && mapboxConf.apiKey) {

  Meteor.methods({
    // eslint-disable-next-line meteor/audit-argument-checks
    async getMapboxAPI() {
      return mapboxConf.apiKey;
    },
  });
}
