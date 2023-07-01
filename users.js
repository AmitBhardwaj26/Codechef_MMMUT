const express=require("express");
const router=new express.Router();
const mongoose= require("mongoose"); // for mongoose.isValidObjectId(Key)
const usermodel=require("./models/students");

require("./database/conn");

// defining the routers
router.get("/", async function (req, res) {
  res.render("Verificationhome");
  });

  router.get("/AdminLogin", function (req, res) {
    res.render("AdminLogin");
  });
  
  router.get("/VerificationusingRollno", async function (req, res) {
    res.render("VerificationusingRollno");
  });
  
  router.get("/Add", function (req, res) {
    res.render("Add");
  });
  
  // Update the data
  router.get("/Update", function (req, res) {
    res.render("Update");
  });
  
  // Update Password
  router.get("/UpdatePassword", function (req, res) {
    res.render("UpdatePassword");
  });
  
  // Delete the data
  router.get("/Delete", function (req, res) {
    res.render("Delete");
  });
  
  
  const CodechefKey="638a57212897d5d755889066";
  const PresidentKey="638a57522897d5d75588906e";
  
  //catching the functionality of verification data
  router.post("/", async function (req, res) {
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
  router.post("/AdminLogin", async function (req, res) {
    const Rollno = req.body.rollno;
    const Password=req.body.password;
    
  
    let PresidentId=await usermodel.findOne({_id :PresidentKey});
    let AdminId=await usermodel.findOne({_id :CodechefKey});
    
    // returns null if no record found.
    if(PresidentId.rollno!=Rollno) res.send("<h1>Roll Number not Matched</h1>");
    else if(AdminId.Password!=Password ) res.send("<h1>Password Not Matched</h1>");
    else   
    {
      res.render("AdminArea");
    }
     
  });
  
  //Fetch data using Roll number
  router.post("/VerificationusingRollno", async function (req, res) {
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
  router.post("/Add", async function (req, res) {
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
  router.post("/Update", async function (req, res) {
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
  router.post("/UpdatePassword", async function (req, res) {
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
  router.post("/Delete", async function (req, res) {
    const Key = req.body.key;
    const Password=req.body.Password;
    
    if(!Key.match(/^[0-9a-fA-F]{24}$/) || !mongoose.isValidObjectId(Key) || Key.length!=24)  res.send("<h1>Key is not valid</h1>");
    else
    {
    var check = await usermodel.findById(Key);
    var AdminId=await usermodel.findOne({_id :CodechefKey});
  
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
  }
  });

module.exports=router;  
