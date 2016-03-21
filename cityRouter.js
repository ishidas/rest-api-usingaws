'use strict';
let express = require('express');
// let app = express();
let CityRouter = express.Router();
// let bodyParser = require('body-parser');
let AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
let s3 = new AWS.S3();

require('./server');


// CityRouter.use(bodyParser.json());

CityRouter.get('/cities', (req, res)=>{
  console.log('here is get request on /cities');
});

CityRouter.get('/city/:id', (req, res)=>{
  console.log('here is get/:id request on /city/:id');
});

CityRouter.post('/cities', (req, res)=>{
  console.log('here is post request on : ' + req.url);
  s3.createBucket({Bucket: 'sawabucket'},()=>{
    var params = {Bucket: 'sawabucket', Key: 'myKey', Body: 'my first bucket!'};
    s3.upload(params, (err, data)=>{
      console.log(data);
      if(err){
        console.log('AWS err here : ' + err);
      } else {
        console.log('Successfully uploaded data : ' + data);
      }
      res.end();
    });
  });
});


CityRouter.put('/city/', (req, res)=>{
  console.log('here is put request on /cities');
});

CityRouter.delete('/cities/:id', (req, res)=>{
  console.log('here is delete request on /cities');
});

module.exports = CityRouter;
