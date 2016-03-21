'use strict';
let express = require('express');
let app = express();
let UserRouter = require('./userRouter');
// let filesRouter = require('./filesRouter');


app.use(UserRouter);
// app.use(filesRouter);

app.listen(3000, ()=>{
  console.log('Port 3000 is listening..');
});
