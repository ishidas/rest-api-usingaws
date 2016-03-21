'use strict';
let express = require('express');
let app = express();
let CityRouter = require('./cityRouter.js');
// let bodyParser = require('body-parser');


app.use(CityRouter);


app.listen(3000, ()=>{
  console.log('Port 3000 is listening..');
});
