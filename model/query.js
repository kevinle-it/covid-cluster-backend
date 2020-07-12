const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let querySchema = new Schema(
  {
    name: String,
    props: {
      [0]: String,
      [1]: String,
      [2]: String,
      [3]: String,
      [4]: String,
      [5]: String,
      coordinates: String,
    },
  },
  { collection: "Query" }
);

const queryModel = mongoose.model("query", querySchema);
module.exports = queryModel;
