'use strict';
const express = require('express');
var UsersRoute = express.Router();
const bodyParser = require('body-parser');
const User = require( __dirname + '/models/UserSchema');
const File = require( __dirname + '/models/filesSchema');

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
var s3 = new AWS.S3();

require('./server');
UsersRoute.use(bodyParser.json());
// UsersRoute.setMaxListeners(0);

UsersRoute.get('/users', (req, res)=>{
  console.log('here is get request on /users');
  User.find({}, (err, user)=>{
    res.json(user);
    res.end();
  });
});

UsersRoute.get('/users/:id', (req, res)=>{
  console.log('here is get/:id request on /users/:id');
  var idUrl = req.params.id;
  User.find({_id: idUrl}, (err, user)=>{
    res.json(user);
    res.end();
  });
});

// UsersRoute.get('/users/:id/', (req, res)=>{
//   console.log('here is get/:id request on /users/:id/files');
//   var idUrl = req.params.id;
//   var query = req.query.Key;
//   console.log(idUrl);
//   console.log(query);
//   var params = {Bucket: 'sawabucket', Key: idUrl , Body: query };
//   s3.getObject(params, (err, data)=>{
//     if(err){
//       return console.log('AWS error : ' + err);
//     }
//     res.send(data.Body);
//     res.end();
//   });
// });

UsersRoute.post('/users', (req, res)=>{
  console.log('here is post request on : ' + req.url);
  var newUser = new User(req.body);
  newUser.save((err, user)=>{
    res.json(user);
  });
  console.log('Here is req.body :  ' + JSON.stringify(req.body));
  s3.createBucket({Bucket: 'sawabucket'},()=>{
    var params = {Bucket: 'sawabucket', Key: req.body.name, Body: JSON.stringify(req.body) };
    console.log(req.body);
    s3.upload(params, (err, data)=>{
      // console.log(data);
      if(err){
        return console.log('AWS err here : ' + err);
      }
      console.log('Successfully uploaded data : ' + JSON.stringify(data));
      res.json(data.Body);

      if(data.ETag){
        var url = s3.getSignedUrl('getObject', {Bucket: 'sawabucket', Key: req.body.name});
        console.log('This is url from aws : ' + url);
        var newFile = new File({url: JSON.stringify(url)});
        newFile.save((err, file)=>{
          if(err){
            return console.log('AWS error : ' + err);
          }
          console.log('Your file url has been save in MongoDB : ' + file);
        });
        res.end();
      }
    });
  });
});
// UsersRoute.post('/users/:id/', (req, res)=>{
//   var idUrl = req.params.id;
//   var query = req.query.Key;
//   console.log(idUrl);
//   console.log(query);
//   var params = {Bucket: 'sawabucket', Key: idUrl, Body: '"' + req.body + '"'};
//   s3.upload(params, (err, data)=>{
//     if(err){
//       return console.log('AWS error : ' + err);
//     }
//     res.send(data.Body);
//     res.end();
//   });
// });

UsersRoute.put('/users/:id', (req, res)=>{
  var idUrl = req.params.id;
  var updateData = {$push: {files: req.body.files }}
  var query = {_id: idUrl};
  console.log('here is PUT request on /users');

  User.update(query, updateData, (err, file)=>{
    console.log('Here is : ' + JSON.stringify(file));
    res.json(file);
    res.end();
  });
});

UsersRoute.delete('/users/:id', (req, res)=>{
  console.log('here is delete request on /users');
  var idUrl = req.params.id;
  User.remove({_id: idUrl}, (err, data)=>{
    if(err){
      return console.log('Error removing item : ' + err);
    }
    console.log('Item removed Successfully! ' +  data);
    res.end();
  });
});

module.exports = UsersRoute;
