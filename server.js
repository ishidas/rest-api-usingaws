'use strict';
let express = require('express');
let app = express();
let UserRouter = require('./userRouter');
// let filesRouter = require('./filesRouter');
let mongoose = require('mongoose');
let DB_PORT = process.env.MONGOLAB_URI || 'mongodb://localhost/db';
mongoose.connect(DB_PORT);

app.use(UserRouter);


app.listen(3000, ()=>{
  console.log('Port 3000 is listening..');
});
