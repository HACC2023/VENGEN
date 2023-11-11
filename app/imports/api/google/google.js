import { Meteor } from 'meteor/meteor';

if (process.env.Google) {
  Meteor.settings.google = JSON.parse(process.env.Google).google;
}

const mapboxConf = Meteor.settings.google || {};

if (mapboxConf && mapboxConf.apiKey) {

  Meteor.methods({
    // eslint-disable-next-line meteor/audit-argument-checks
    async getGoogleAPI() {
      return mapboxConf.apiKey;
    },
  });
}
