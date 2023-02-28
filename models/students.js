
const mongoose= require("mongoose");
const validator=require("validator");

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
    Password:{
      type:String,
      default: "-",
    },
    
  });
  
  //creating a model/ new collection
const usermodel = mongoose.model("user", userschema);
module.exports=usermodel;   

//creating a new document/ type
// const user = new usermodel({
//     name: "Amit Bhardwaj",
//     batch: "2020-24",
//     role: "vice President",
//   });
//end of database
  
