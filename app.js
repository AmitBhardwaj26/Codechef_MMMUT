const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
app.use('/css', express.static("css"));
// app.use(express.static("css"));
app.use(express.static('Html'));
//ejs
app.set('view engine','ejs');

//body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Creating the Database
const { default: mongoose } = require("mongoose");
// connect with mongoose
// mongoose.connect("mongodb://localhost:27017/Codechef1",{useNewUrlParser:true});
const dbConnection = () => {
  try {
    mongoose.connect("mongodb+srv://Codehef:amit9140@cluster0.hphjaf9.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("successfully connected");
  } catch (err) {
    console.log(err);
  }
};
dbConnection();
// mongoose.connect("mongodb://localhost:27017/Codechef1",{useNewUrlParser:true});

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

//creating a model
const usermodel = mongoose.model("user", userschema);

//creating a new document
const user = new usermodel({
  name: "Amit Bhardwaj",
  batch: "2020-24",
  role: "vice President",
});
//end of database


//requests
app.get("/", async function (req, res) {
  res.sendFile(__dirname + "/Html/Verificationhome.html");
});

app.get("/AdminLogin", function (req, res) {
  res.sendFile(__dirname + "/Html/AdminLogin.html");
});

app.get("/VerificationusingRollno", async function (req, res) {
  res.sendFile(__dirname + "/Html/VerificationusingRollno.html");
});

app.get("/Add", function (req, res) {
  res.sendFile(__dirname + "/Html/Add.html");
});

// Update the data
app.get("/Update", function (req, res) {
  res.sendFile(__dirname + "/Html/Update.html");
});

// Update Password
app.get("/UpdatePassword", function (req, res) {
  res.sendFile(__dirname + "/Html/UpdatePassword.html");
});

// Delete the data
app.get("/Delete", function (req, res) {
  res.sendFile(__dirname + "/Html/Delete.html");
});


const CodechefKey="638a57212897d5d755889066";
const PresidentKey="638a57522897d5d75588906e";

//catching the functionality of verification data
app.post("/", async function (req, res) {
  const Key = req.body.key;
  var check;
  if (mongoose.isValidObjectId(Key)) {
    check = await usermodel.findById(Key);
    // returns null if no record found.
  }
   if (check)  
  {
    //render ejs file
    res.render("form", {users: check });
  }
  else res.send("<h1>Not found in Database</h1>");
});

// Catch the AdminLogin post Request
app.post("/AdminLogin", async function (req, res) {
  const Rollno = req.body.rollno;
  const Password=req.body.password;
  

  let PresidentId=await usermodel.findOne({_id :PresidentKey});
  let AdminId=await usermodel.findOne({_id :CodechefKey});
  
  // returns null if no record found.
  if(PresidentId.rollno!=Rollno) res.send("<h1>Roll Number not Matched</h1>");
  else if(AdminId.Password!=Password ) res.send("<h1>Password Not Matched</h1>");
  else   
  {
    res.sendFile(__dirname + "/Html/AdminArea.html");
  }
   
});

//Fetch data using Roll number
app.post("/VerificationusingRollno", async function (req, res) {
  const Rollno = req.body.rollno;
   
  var check= await usermodel.findOne({ rollno: Rollno });
    // returns null if no record found.
  
  if (check)  
  {
    res.render("form", {users: check });
  }
  else res.send("<h1>Not found in Database</h1>");
});

//add functionality
app.post("/Add", async function (req, res) {
  const Rollno = req.body.rollno,
    Name = req.body.name,
    Year = req.body.year,
    Role = req.body.role,
    Message = req.body.message,
    Password=req.body.Password;

    
    const user = new usermodel({
      rollno: Rollno,
      name: Name,
      batch: Year,
      role: Role,
      message: Message,
    });

  let IDPresent = await usermodel.findOne({ rollno: Rollno });
  let AdminId=await usermodel.findOne({_id :CodechefKey});

  // check if password match with id and unique roll number length is 10 or not and if same roll number exist then redirect
  if(AdminId.Password!=Password) res.send("<h1>Password Not Matched</h1>");
  else if( IDPresent ) {  res.send("<h1>ID Present</h1>"); }
  else if( Rollno.length!=10) {  res.send("<h1>Length of Roll Number Must be 10</h1>"); }
  else {
    await user.save();
    let resDB =await usermodel.findOne({ rollno: Rollno });
      let id =resDB._id;
      // console.log(id);
      res.send(id);
  }
  res.send();
});

//catch the update post request
app.post("/Update", async function (req, res) {
  const Rollno = req.body.rollno,
    Name = req.body.name,
    Year = req.body.year,
    Role = req.body.role,
    Message = req.body.message,
    Password=req.body.Password;


  let IDPresent = await usermodel.findOne({ rollno: Rollno });
  let AdminId=await usermodel.findOne({_id :CodechefKey});

  // check if password match with id and unique roll number length is 10 or not and if same roll number exist then redirect
  if(AdminId.Password!=Password) res.send("<h1>Password Not Matched</h1>");
  else if( IDPresent && Rollno.length==10) {
     
     usermodel.updateOne({rollno: Rollno},
       {name:Name,year:Year,role:Role,message:Message},
       (err)=> {if(err) console.log(err); else console.log("success"); } 
     );
     res.send("<h1>Data Updated successfully</h1>");
     
     //issue old date show after updated await not working 
     //let check =await usermodel.findOne({rollno:Rollno});
     //  res.render("form", {users: check });  
  }
  else res.send("<h1>Not found in Database</h1>");
});

// Catch the Update Password Request
app.post("/UpdatePassword", async function (req, res) {
  const Rollno = req.body.rollno;
  const PresPassword=req.body.presidentpassword;
  const NewPassword=req.body.newpassword;
  
  let PresidentId=await usermodel.findOne({_id :PresidentKey});
  let CodechefId=await usermodel.findOne({_id :CodechefKey});
   

  if(PresidentId.rollno != Rollno) res.send("<h1>Roll number Not matched</h1>");
  else if(PresidentId.Password!=PresPassword) res.send("<h1>President Password Not Matched</h1>");
  else    
  {
     usermodel.updateOne({_id: CodechefId},
      {Password: NewPassword},
      (err)=> {if(err) console.log(err); else console.log("success"); } 
     );
      res.send("<h1>Password is Successfully Updated</h1>")
  }
});

// Catch the Delete post Request
app.post("/Delete", async function (req, res) {
  const Key = req.body.key;
  const Password=req.body.Password;
  
  
  var check = await usermodel.findById(Key);
  let AdminId=await usermodel.findOne({_id :CodechefKey});

  // returns null if no record found.
  if(Key==CodechefKey) {check=null; res.redirect('/Delete'); }
  else if(AdminId.Password!=Password) res.send("<h1>Password Not Matched</h1>");
  else if (check)   
  {
     usermodel.deleteOne( {"_id": Key}, 
       (err)=> {if(err) console.log(err); else console.log("Deleted"); });
      res.send("<h1>Data Deleted From Database</h1>")
  }
  else res.send("<h1>Not found in Database</h1>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

