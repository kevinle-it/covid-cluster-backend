const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require("body-parser")
const mongoose = require('mongoose')
const queryModel = require('./model/query')
const coordinatesModel = require('./model/coordinates')
const {
  addHex,
  searchHex,
  removeHex,
} = require('./hexaUtils.mongoDbVersion');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  try {
    const gridData = await coordinatesModel.find({});
    console.log(gridData);

    res.send({ data: gridData });
  } catch (err) {
    res.status(500).send(err);
  }
});


// search hexa
app.get('/api/v1/hexa/:hexaname', async (req, res) => {
	const { hexaname } = req.params;

	console.log('search hexaname', hexaname);

	try {
    const hexResult = await searchHex(hexaname, queryModel);

    if (hexResult) {
      res.status(200).send({
        data: { ...hexResult },
      });
    }
    res.status(404).send({ message: 'Hexagon not found!' });
  } catch (err) {
    res.status(500).send(err);
  }
})


// remove hexa
app.delete('/api/v1/hexa/:hexaname', async (req, res) => {
	const { hexaname } = req.params;

	console.log('remove hexaname', hexaname);

	try {
    const hexResult = await removeHex(hexaname, queryModel, coordinatesModel);

    if (hexResult) {
      res.status(200).send({
        data: { ...hexResult },
      });
    }
    res.status(405).send({ message: 'Cannot remove this hexagon!' });
  } catch (err) {
    res.status(500).send(err);
  }
})


// add hexa
app.post('/api/v1/hexa', async (req, res) => {

	console.log('add hexaname', req.body)

	try {
    const { name, neighbor, border } = req.body;

    const newHex = await addHex({ name, toHexName: neighbor, atBorderNo: border, queryModel, coordinatesModel });
    if (newHex) {
      res.status(200).send({
        data: {
          coordinates: newHex.coordinates,
          name: newHex.name,
        }
      });
    }
    res.status(405).send({ message: 'Cannot add this hexagon!' });
	} catch (err) {
		res.status(500).send(err);
	}
})


app.listen(8000, function() {
  console.log('listening on 8000');
});


module.exports = app;
