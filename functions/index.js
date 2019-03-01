const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const express = require('express');
const cors = require('cors');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
app.use(cors({ origin: true }));

app.get('/api/health', (req, res) => {
  res.status(200).send(JSON.stringify('active.'));
});

app.post('/api/csv_fileupload', (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const uploads = {};
  const allowMimeTypes = ['text/csv'];
  const storage = new Storage();
  const bucket = storage.bucket(functions.config().fileupload.bucket.name);

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (!allowMimeTypes.includes(mimetype.toLocaleLowerCase())) {
      console.warn('disallow mimetype: ' + mimetype);
      return;
    }
    const tmpdir = os.tmpdir();
    const filepath = path.join(tmpdir, filename);
    file.pipe(fs.createWriteStream(filepath));

    file.on('end', () => {
      console.log('upload file: ' + filepath + ' metadata: ' + mimetype);
      uploads[fieldname] = { filepath, mimetype };
      bucket.upload(filepath, { destination: `f-expend_csv/${path.parse(filepath).base}`, metadata: { contentType: mimetype } })
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

exports.api = functions.https.onRequest(app)