'use strict';
let express = require('express');
// let app = express();
let CityRouter = express.Router();
let bodyParser = require('body-parser');
let AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
let s3 = new AWS.S3();

require('./server');


CityRouter.use(bodyParser.json());

CityRouter.get('/cities', (req, res)=>{
  console.log('here is get request on /cities');
  var params = {Bucket: 'sawabucket', Key:'cities' };
  s3.getObject(params, (err, data)=>{
    if(err){
      return console.log('AWS error : ' + err);
    }
    res.send(data.Body);
    res.end();
  });
});

CityRouter.get('/cities/:id', (req, res)=>{
  console.log('here is get/:id request on /cities/:id');
  var idUrl = req.params.id;
  var params = {Bucket: 'sawabucket', Key: idUrl};
  s3.getObject(params, (err, data)=>{
    if(err){
      return console.log('AWS error : ' + err);
    }
    res.send(data.Body);
    res.end();
  });
});

CityRouter.post('/cities', (req, res)=>{
  console.log('here is post request on : ' + req.url);
  s3.createBucket({Bucket: 'sawabucket'},()=>{
    var params = {Bucket: 'sawabucket', Key: 'cities', Body: 'my first bucket!'};
    s3.upload(params, (err, data)=>{
      console.log(data);
      if(err){
        console.log('AWS err here : ' + err);
      } else {
        console.log('Successfully uploaded data : ' + data);
      }
      res.send(data.Body);
      res.end();
    });
  });
});


CityRouter.put('/city/', (req, res)=>{
  var idUrl = req.query.Key;
  console.log(idUrl);
  console.log(req.body);
  console.log('here is PUT request on /cities');
  var params = {Bucket: 'sawabucket', Key: idUrl, Body: 'This is new data'};
  s3.putObject(params, (err, data)=>{
    if(err){
      return console.log('AWS error : ' + err);
    }
    res.send(data.Body);
    console.log(data.Body);
    res.end();
  });
});

CityRouter.delete('/cities/:id', (req, res)=>{
  console.log('here is delete request on /cities');
  var idUrl = req.params.id;
  var params = {Bucket: 'sawabucket', Key: idUrl};
  s3.deleteObject(params, (err, data)=>{
    if(err){
      return console.log('AWS error : ' + err);
    }
    res.send(data + ' object has been deleted!');
    res.end();
  });
});

module.exports = CityRouter;
