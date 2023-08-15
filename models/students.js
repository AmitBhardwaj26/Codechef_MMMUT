const mongoose = require("mongoose");
const validator = require("validator");

// create schema
const userschema = new mongoose.Schema({
  rollno: {
    type: Number,
    unique: true,
    required: function () {
      return (this.rollno.length = 10);
    },
  },
  name: String,
  batch: String,
  role: String,
  message: {
    type: String,
    default: "-",
  },
  password: {
    type: String,
    default: "-",
  },
});

//creating a model/ new collection
const usermodel = mongoose.model("user", userschema);
module.exports = usermodel;
