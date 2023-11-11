import { FilesCollection } from 'meteor/ostrio:files';

export const Images = new FilesCollection({
  collectionName: 'images',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 20971520 && /png|jpg|jpeg|glb/i.test(file.extension)) {
      return true;
    }
    return 'Please upload image, with size equal or less than 20MB';
  },
});

// if (Meteor.isClient) {
//   Meteor.subscribe('files.images.all');
// }
//
// if (Meteor.isServer) {
//   Meteor.publish('files.images.all', function () {
//     return Images.find().cursor;
//   });
// }
