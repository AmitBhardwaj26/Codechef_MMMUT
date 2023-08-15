const express = require("express"); // Importing the Express framework
const bodyParser = require("body-parser"); // Importing the body-parser middleware
const router = require("./users"); // Importing the custom router from the "users" module
const app = express(); // Creating an instance of the Express application
const path = require("path"); // Importing the path module for working with file paths
const hbs = require("hbs"); // Importing the Handlebars view engine
const cookieParser = require("cookie-parser"); // Importing the cookie-parser middleware

// Set the view engine to Handlebars (hbs) and configure view paths
app.set("view engine", "hbs");
const template_path = path.join(__dirname, "/templates/views");
const partials_path = path.join(__dirname, "/templates/partials");
app.set("views", template_path);
hbs.registerPartials(partials_path); // Registering partials for Handlebars

app.use("/css", express.static("css")); // Serving static files from the "css" directory
app.use(bodyParser.urlencoded({ extended: true })); // Using body-parser to parse URL-encoded data
app.use(bodyParser.json()); // Using body-parser to parse JSON data in the request body

app.use(router); // Using the custom router for handling routes
app.use(express.json()); // Parsing JSON data in the request body
app.use(cookieParser()); // Using cookie-parser middleware for working with cookies

// The following line doesn't seem to have any effect and can be removed
app;

const PORT = process.env.PORT || 3000; // Defining the port to listen on
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`); // Logging a message when the server starts
});
