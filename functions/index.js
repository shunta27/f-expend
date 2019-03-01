const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));

app.get('/api/health', (req, res) => {
  res.json('active.');
});

exports.api = functions.https.onRequest(app)