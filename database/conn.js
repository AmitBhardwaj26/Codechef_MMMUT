// Creating the Database
const mongoose = require("mongoose");
mongoose.set('strictQuery', true); // for strictquery warning
// connect with mongoose

const dotenv = require('dotenv'); 
dotenv.config(); 

const dbConnection = async() => {
  try {
    await mongoose.connect("process.env.MONGO_URL", {  //process.env.MONGO_URL
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("successfully connected");
  } catch (err) {
    console.log("NO connection");
    console.log(err);
  }
};

dbConnection();
