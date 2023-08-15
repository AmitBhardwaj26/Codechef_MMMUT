const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose"); // Importing mongoose for database operations
const usermodel = require("./models/students"); // Importing the user model
const bcrypt = require("bcrypt"); // Importing bcrypt for password hashing
const JWT = require("jsonwebtoken"); // Importing JWT for token generation and validation
const auth = require("./middlewares/auth"); // Importing custom authentication middleware
require("./database/conn"); // Establishing database connection
require("dotenv").config(); // Loading environment variables

// Defining various routes and their functionalities

// Home route
router.get("/", async function (req, res) {
  res.render("Verificationhome"); // Rendering the "Verificationhome" view
});

// Admin login route
router.get("/AdminLogin", function (req, res) {
  res.render("AdminLogin"); // Rendering the "AdminLogin" view
});

// Admin area route with authentication middleware
router.get("/AdminArea", auth, function (req, res, next) {
  res.render("AdminArea"); // Rendering the "AdminArea" view after authentication
});

// Verification using roll number route
router.get("/Verificationusingrollno", async function (req, res) {
  res.render("Verificationusingrollno"); // Rendering the "Verificationusingrollno" view
});

// Add data route
router.get("/Add", function (req, res) {
  res.render("Add"); // Rendering the "Add" view
});

// Update data route
router.get("/Update", function (req, res) {
  res.render("Update"); // Rendering the "Update" view
});

// Update password route
router.get("/Updatepassword", function (req, res) {
  res.render("Updatepassword"); // Rendering the "Updatepassword" view
});

// Delete data route
router.get("/Delete", function (req, res) {
  res.render("Delete"); // Rendering the "Delete" view
});

// Admin logout route
router.get("/AdminLogout", function (req, res) {
  res.render("/AdminLogout"); // Rendering the "/AdminLogout" view
});

// Retrieving secret keys from environment variables
const CodechefKey = process.env.Codechecfkey;
const PresidentKey = process.env.Presidentkey;

// Functionality to handle verification data
router.post("/", async function (req, res) {
  const Key = req.body.key; // Getting the key from the request body
  var check;
  if (mongoose.isValidObjectId(Key)) {
    check = await usermodel.findById(Key); // Checking if the key is a valid ObjectId and retrieving data
  }
  if (check) {
    res.render("form", { users: check }); // Rendering the "form" view with retrieved user data
  } else {
    res.send("<h1>Not found in Database</h1>"); // Responding with a message if no data is found
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true }).render("AdminArea"); // Clearing the token cookie and rendering the "AdminArea" view
  res.status(200).json({ message: "Logged out successfully" }); // Responding with a success message
});

// Admin login route
router.post("/AdminLogin", async function (req, res) {
  // Handling admin login functionality
  try {
    const { rollno, password } = req.body; // Getting rollno and password from the request body

    if (!(rollno && password)) {
      return res.status(400).send(`All fields are required`);
    }

    // Retrieving user data based on predefined keys
    let PresidentId = await usermodel.findOne({ _id: PresidentKey });
    let AdminId = await usermodel.findOne({ _id: CodechefKey });

    // Matching the provided roll number with stored roll numbers
    if (PresidentId.rollno != rollno) {
      res.status(400).send("<h1>roll Number not Matched</h1>");
    }

    // Matching the provided password with the stored hashed password
    const correctpassword = await bcrypt.compare(password, AdminId.password);
    if (correctpassword) {
      // Generating a JWT token for the user
      const token = JWT.sign(
        { id: PresidentId._id, email: PresidentId.email },
        process.env.JWT_SECRET, // Using JWT secret key
        { expiresIn: "10h" }
      );

      // Configuring options for the token cookie
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      // Setting the token as a cookie and rendering the "AdminArea" view
      res.cookie("token", token, options).status(200).render("AdminArea");
    } else {
      res.status(400).send("<h1>Password Not Matched</h1>");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});
// Fetch data using roll number route
router.post("/Verificationusingrollno", auth, async function (req, res) {
  console.log(req.params); // Logging request parameters (if any)
  const rollno = req.body.rollno; // Getting roll number from the request body

  try {
    const check = await usermodel.findOne({ rollno: rollno }); // Finding user data based on the provided roll number
    if (check) {
      res.render("form", { users: check }); // Rendering the "form" view with the retrieved user data
    } else {
      res.send("<h1>Not found in Database</h1>"); // Responding with a message if no data is found
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" }); // Responding with an error message
  }
});

// Add functionality route
router.post("/Add", async function (req, res) {
  const { rollno, name, year, role, message, password } = req.body; // Getting various data from the request body

  // Creating a new user model instance
  const user = new usermodel({
    rollno: rollno,
    name: name,
    batch: year,
    role: role,
    message: message,
  });

  // Checking if the provided roll number already exists in the database
  let IDPresent = await usermodel.findOne({ rollno: rollno });
  let AdminId = await usermodel.findOne({ _id: CodechefKey });

  // Comparing the provided password with the stored hashed password
  const correctpassword = await bcrypt.compare(password, AdminId.password);

  // Handling different cases based on the provided data
  if (correctpassword == false) {
    res.send("<h1>password Not Matched</h1>");
  } else if (IDPresent) {
    res.send("<h1>ID Present</h1>");
  } else if (rollno.length != 10) {
    res.send("<h1>Length of roll Number Must be 10</h1>");
  } else {
    await user.save(); // Saving the new user data to the database
    let resDB = await usermodel.findOne({ rollno: rollno });
    let id = resDB._id;
    res.send(id); // Sending the ID of the added user
  }
  res.send(); // Sending a response
});

// Update post request route
router.post("/Update", auth, async function (req, res) {
  const rollno = req.body.rollno,
    Name = req.body.name,
    Year = req.body.year,
    Role = req.body.role,
    Message = req.body.message,
    password = req.body.password;

  // Checking if the provided roll number and password match the stored data
  let IDPresent = await usermodel.findOne({ rollno: rollno });
  let AdminId = await usermodel.findOne({ _id: CodechefKey });
  const correctpassword = await bcrypt.compare(password, AdminId.password);

  // Handling different cases based on the provided data
  if (correctpassword == false) {
    res.send("<h1>password Not Matched</h1>");
  } else if (IDPresent && rollno.length == 10) {
    // Updating the user data based on the provided information
    usermodel.updateOne(
      { rollno: rollno },
      { name: Name, year: Year, role: Role, message: Message },
      (err) => {
        if (err) console.log(err);
        else console.log("success");
      }
    );
    res.send("<h1>Data Updated successfully</h1>");
  } else {
    res.send("<h1>Not found in Database</h1>");
  }
});

// Update password request route
router.post("/Updatepassword", auth, async function (req, res) {
  const rollno = req.body.rollno;
  const Prespassword = req.body.presidentpassword;
  const Newpassword = req.body.newpassword;

  // Hashing the new password
  const salt = await bcrypt.genSalt(10);
  const myEncryptpassword = await bcrypt.hash(Newpassword, salt);
  const temp = await bcrypt.hash("AMIT1234", salt);

  // Retrieving President and Codechef user data based on predefined keys
  let PresidentId = await usermodel.findOne({ _id: PresidentKey });
  let CodechefId = await usermodel.findOne({ _id: CodechefKey });

  // Checking if the provided roll number matches the President's roll number
  if (PresidentId.rollno != rollno) {
    res.send("<h1>roll number Not matched</h1>");
  }

  // Comparing provided password with the President's password
  const correctpassword = await bcrypt.compare(
    Prespassword,
    PresidentId.password
  );

  // Handling different cases based on the provided data
  if (correctpassword == false) {
    res.send("<h1>President password Not Matched</h1>");
  } else {
    // Updating the Codechef user's password with the new encrypted password
    usermodel.updateOne(
      { _id: CodechefId },
      { password: myEncryptpassword },
      (err) => {
        if (err) console.log(err);
        else console.log("success");
      }
    );
    res.send("<h1>password is Successfully Updated</h1>");
  }
});
// Catch the Delete post Request
router.post("/Delete", auth, async function (req, res) {
  const Key = req.body.key; // Getting the key from the request body
  const password = req.body.password; // Getting the password from the request body

  // Checking if the provided key is a valid MongoDB ObjectId and has the correct length
  if (
    !Key.match(/^[0-9a-fA-F]{24}$/) ||
    !mongoose.isValidObjectId(Key) ||
    Key.length != 24
  )
    res.send("<h1>Key is not valid</h1>");
  else {
    var check = await usermodel.findById(Key); // Querying user data based on the provided key
    var AdminId = await usermodel.findOne({ _id: CodechefKey }); // Retrieving Admin's user data based on CodechefKey

    const correctpassword = await bcrypt.compare(password, AdminId.password); // Comparing the provided password with the stored hashed password

    // Handling different cases based on the provided data
    if (Key == CodechefKey) {
      check = null;
      res.redirect("/Delete"); // Redirecting to "/Delete" route if the provided key matches CodechefKey
    } else if (correctpassword == false) {
      res.send("<h1>password Not Matched</h1>"); // Responding if the provided password doesn't match
    } else if (check) {
      // Deleting user data based on the provided key
      usermodel.deleteOne({ _id: Key }, (err) => {
        if (err) console.log(err);
        else console.log("Deleted");
      });
      res.send("<h1>Data Deleted From Database</h1>"); // Sending a success message
    } else {
      res.send("<h1>Not found in Database</h1>"); // Responding if no data is found
    }
  }
});

module.exports = router; // Exporting the router for use in other parts of the application
