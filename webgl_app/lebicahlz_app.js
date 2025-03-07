const express = require("express");
const axios = require('axios');
const rate_limit = require('express-rate-limit');

const path = require('path');

const port = 3002;

const limiter = rate_limit({
  windowMs: 5 * 1000,
  max: 100,
  message: "Only 100 requests allowed per 5s",
});

const app = express();

app.use(express.static(__dirname));

app.use(limiter);

async function run() {
  
  const filePath = path.join("./", "./index.html");
  
  app.listen(port, async () => {
    console.log('Server running on port: ' + port);
  });
  
  app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname,"./index.html"))
    //console.log("someone visited the website!")
  });
  
  /*
  app.get("/test_status", (request, response) => {
    const status = {
      "Status": "Running"
    };
    response.send(status);
  });
  */
}

run().catch(console.dir);