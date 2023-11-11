import { Meteor } from 'meteor/meteor';
import { OpenAI } from 'openai'; // Import the OpenAI class

if (process.env.Openai) {
  Meteor.settings.openai = JSON.parse(process.env.Openai).openai;
}

const dalleConf = Meteor.settings.openai || {};
// const bound = Meteor.bindEnvironment((callback) => callback());

if (dalleConf && dalleConf.apiKey) {
  const openai = new OpenAI({
    apiKey: dalleConf.apiKey, // Set the apiKey in the constructor
  });

  Meteor.methods({
    // eslint-disable-next-line meteor/audit-argument-checks
    async createImage(prompt, n, size) {
      try {
        return await openai.images.generate({
          prompt,
          n,
          size,
        });
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw new Meteor.Error('openai-error', 'Error calling OpenAI API', error);
      }
    },
  });
}
