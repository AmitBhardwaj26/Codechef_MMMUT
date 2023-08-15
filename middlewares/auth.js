const jwt = require("jsonwebtoken"); // Importing the JSON Web Token library
const dotenv = require("dotenv"); // Importing the dotenv library for loading environment variables
dotenv.config(); // Loading environment variables from .env file

const auth = async (req, res, next) => {
  console.log(`call authentication`); // Logging the start of authentication process
  // console.log(req.headers.cookie);
  const cookieHeader = req.headers.cookie; // Getting the "Cookie" header from the request
  // Parse the cookie header to get individual cookies
  if (!cookieHeader) {
    return res.status(403).send("Please login to access this route"); // Responding with an error if no cookies are found
  }
  const cookies = cookieHeader.split("; "); // Splitting the cookies into individual pieces

  // Create an object to store the cookies
  const parsedCookies = {};

  // Iterate through the cookies and parse them
  for (const cookie of cookies) {
    const [name, value] = cookie.split("="); // Splitting each cookie into name and value
    parsedCookies[name] = value; // Storing the parsed cookies in an object
  }

  // Now you can access individual cookies by their names
  const token = parsedCookies.token; // Getting the value of the "token" cookie
  console.log(token);
  if (!token) {
    return res.status(404).send("Please login to access this route"); // Responding with an error if the "token" cookie is missing
  }

  try {
    // Verifying the JWT token with the provided secret and handling potential errors
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decodedToken) => {
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ message: "Token expired" }); // Responding with an error if the token is expired
        } else if (err) {
          return res.status(401).json({ message: "Invalid token" }); // Responding with an error if the token is invalid
        }
      }
    );
    req.user = decoded; // Storing the decoded token payload in the request object
    next(); // Proceeding to the next middleware
  } catch (err) {
    console.log(err); // Logging any errors that occurred during token verification
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" }); // Responding with an error if the user is not authorized
  }
};

module.exports = auth; // Exporting the authentication middleware for use in other parts of the application
