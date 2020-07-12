const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let coordinatesSchema = new Schema({
    coordinates: String,
    name: String,
  },
  { collection: "Coordinates" }
);

const coordinatesModel = mongoose.model("coordinates", coordinatesSchema);
module.exports = coordinatesModel;
