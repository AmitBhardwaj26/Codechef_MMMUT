const express = require("express");
const bodyParser = require("body-parser");
const router=require("./users");
const app = express();
const path = require('path');
const hbs= require("hbs");

app.set("view engine","hbs");  //ejs

const template_path=path.join(__dirname,"/templates/views");
const partials_path=path.join(__dirname,"/templates/partials");


app.set("view engine","hbs");   //hbs
app.set("views",template_path); 
hbs.registerPartials(partials_path); //register the partials call

app.use('/css', express.static("css"));
app.use(bodyParser.urlencoded({ extended: true }));  //body parser
app.use(router); // use the routers


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

