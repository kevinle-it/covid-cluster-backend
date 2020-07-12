const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let coordinatesSchema = new Schema({
     coor: {
      type: String
    },
    name: {
      type: String
    }
  },
  { collection: "Coordinates" }
);

const Coordinates = mongoose.model("coordinates", coordinatesSchema);
module.exports = Coordinates