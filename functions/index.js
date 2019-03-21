const admin = require("firebase-admin");
const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const express = require('express');
const cors = require('cors');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const iconv = require('iconv-lite');
const csv = require('csvtojson');

admin.initializeApp({
  credential: admin.credential.cert({
    "private_key": `${functions.config().service_account.private_key}`,
    "type": `${functions.config().service_account.type}`,
    "client_email": `${functions.config().service_account.client_email}`,
    "client_x509_cert_url": `${functions.config().service_account.client_x509_cert_url}`,
    "auth_uri": `${functions.config().service_account.auth_uri}`,
    "token_uri": `${functions.config().service_account.token_uri}`,
    "project_id": `${functions.config().service_account.project_id}`,
    "client_id": `${functions.config().service_account.client_id}`,
    "auth_provider_x509_cert_url": `${functions.config().service_account.auth_provider_x509_cert_url}`,
    "private_key_id": `${functions.config().service_account.private_key_id}`
  }),
  databaseURL: 'https://f-expend.firebaseio.com'
});

const app = express();
app.use(cors({ origin: true }));

app.get('/api/health', (req, res) => {
  res.status(200).send(JSON.stringify('active.'));
});

app.post('/api/csv_fileupload', (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const uploads = {};
  const allowMimeTypes = ['text/csv'];
  const bucket = (new Storage()).bucket(functions.config().fileupload.bucket.name);

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (!allowMimeTypes.includes(mimetype.toLocaleLowerCase())) {
      console.warn('disallow mimetype: ' + mimetype);
      return;
    }
    const filepath = path.join(os.tmpdir(), filename);

    // to utf8
    file
      .pipe(iconv.decodeStream('SHIFT_JIS'))
      .pipe(iconv.encodeStream('UTF-8'))
      .pipe(fs.createWriteStream(filepath));

    file.on('end', () => {
      console.log('upload file: ' + filepath + ' metadata: ' + mimetype);
      uploads[fieldname] = { filepath, mimetype };
      bucket.upload(filepath, {
        destination: `${functions.config().fileupload.bucket.alias}/${path.parse(filepath).base}`,
        metadata: { contentType: mimetype }
      })
      .then(() => {
        console.log('file upload success: ' + filepath);
        return new Promise((resolve, reject) => {
          fs.unlink(filepath, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      })
      .catch(err => {
        console.error(err);
      });
    });
  });

  busboy.on('finish', () => {
    if (Object.keys(uploads).length === 0) {
      res.status(200).send('success: 0 file upload');
      return;
    }
    console.log('finish: ' + JSON.stringify(uploads));
    res.status(200).send(JSON.stringify(uploads));
  });

  busboy.end(req.rawBody);
});

// api
exports.api = functions.https.onRequest(app)

// notice CsvFileUploadBucket
exports.noticeCsvUpload = functions.storage.object(functions.config().fileupload.bucket.name).onFinalize((object) => {
  const bucketName = functions.config().fileupload.bucket.alias;
  const filePath = object.name;
  const fileName = filePath.replace(`${bucketName}/`,'');
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const bucket = (new Storage()).bucket(functions.config().fileupload.bucket.name);
  const db = admin.firestore();
  const ref = db.collection('csv_data');

  return bucket.file(filePath).download({
    destination: tempFilePath,
  })
  .then(() => {
    const parseCsv = async () => {
      const jsonArray = await csv({
        noheader: false,
        headers: ['h1','h2','h3','h4','h5','h6','h7']
      }).fromFile(tempFilePath);
      return jsonArray
        .filter((record, index) => { return (index < jsonArray.length - 1 ) })
        .map((record) => {
          return {
            'using_day':record.h2.replace(/(\d+)年(\d+)月(\d+)日/g , "$1$2$3"),
            'place':record.h3,
            'price':record.h5
          };
        });
    }
    return parseCsv();
  })
  .then((data) => {
    console.log('csv to json parse data:' + JSON.stringify(data));
    data.forEach(async (record) => {
      await ref.add(record);
      return;
    });
    return new Promise((resolve, reject) => {
      fs.unlink(tempFilePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  })
  .catch(err => {
    console.error(err);
  });
});