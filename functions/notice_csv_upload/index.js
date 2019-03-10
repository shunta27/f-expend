const functions = require('firebase-functions');

const csvFileUploadBucket = functions.storage.object(functions.config().fileupload.bucket.name)
exports.noticeCsvUpload = csvFileUploadBucket.onFinalize((object) => {
  const filePath = object.name;
  const contentType = object.contentType;
  console.log(filePath, contentType)
});