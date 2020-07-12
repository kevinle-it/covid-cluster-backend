const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const coordinatesModel = require('./model/coordinates.js');

mongoose.connect('mongodb+srv://covid-cluster:thientai@cluster0.crjje.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
  console.log('we\'re connected');
});

app.use(cors({ origin: true, credentials: true }));

// get all
app.get('/api/v1/hexa', async(req, res) => {
  const hexaGridData = {
    '0,0': 'ax',
    '0,-1': 'bx',
    '0,1': 'cx',
    '1,-1': 'dx',
    '1,0': 'ex',
    '-1,1': 'fx',
    '-1,0': 'gx',
    '-2,0': 'hx',
  };

  const gridData = await coordinatesModel.find({});

  try {
    console.log(gridData);
  } catch (err) {
    res.status(500).send(err);
  }

  res.send({ data: hexaGridData });
});


// search hexa
app.get('/api/v1/hexa/:hexaname', (req, res) => {
  const hexaname = req.params.hexaname;

  console.log('hexaname', hexaname);
});


// remove hexa
app.delete('/api/v1/hexa/:hexaname', (req, res) => {
  const hexaname = req.params.hexaname;

  console.log('hexaname', hexaname);
});


// add hexa
app.post('/api/v1/hexa/:hexaname', (req, res) => {
  const hexaname = req.params.hexaname;

  console.log('hexaname', hexaname);
});


app.listen(8000, function() {
  console.log('listening on 8000');
});


module.exports = app;
