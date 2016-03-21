'use strict';
let express = require('express');
// let app = express();
var UsersRoute = express.Router();
let bodyParser = require('body-parser');
let AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
let s3 = new AWS.S3();

require('./server');


UsersRoute.use(bodyParser.json());

UsersRoute.get('/users', (req, res)=>{
  console.log('here is get request on /users');
  var params = {Bucket: 'sawabucket', Key:'users' };
  s3.getObject(params, (err, data)=>{
    if(err){
      return console.log('AWS error : ' + err);
    }
    res.send(data.Body);
    res.end();
  });
});

UsersRoute.get('/users/:id', (req, res)=>{
  console.log('here is get/:id request on /users/:id');
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

// UsersRoute.get('/users/:id/files');

UsersRoute.post('/users', (req, res)=>{
  console.log('here is post request on : ' + req.url);
  console.log(req.body);
  s3.createBucket({Bucket: 'sawabucket'},()=>{
    var params = {Bucket: 'sawabucket', Key: 'users', Body: '"' + req.body +'"' };
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


UsersRoute.put('/users/:id', (req, res)=>{
  var idUrl = req.params.id;
  console.log(idUrl);
  console.log(req.body);
  console.log('here is PUT request on /users');
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

UsersRoute.delete('/users/:id', (req, res)=>{
  console.log('here is delete request on /users');
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

module.exports = UsersRoute;
