const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require("./config/db");
var cors = require('cors')
const app = express();
const port = 3000;

require("dotenv").config();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors())

connectDB();

app.use('/', require('./routes'))

app.get("/ping", (req, res, next) => {
    return res.status(200).json({
      message: "Hello World!",
    });
  });


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});