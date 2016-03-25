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
  User.find({}, (err, user)=>{
    res.json(user);
    res.end();
  });
});

UsersRoute.get('/users/:id', (req, res)=>{
  var idUrl = req.params.id;
  User.find({_id: idUrl}, (err, user)=>{
    res.json(user);
    res.end();
  });
});

UsersRoute.get('/users/:id/files', (req, res)=>{
  console.log('here is get/:id request on /users/:id/files');
  var idUrl = req.params.id;
  var query = req.url.split('/')[3];
  console.log(idUrl);
  console.log(query);
  File.find({_id: idUrl},(err, file)=>{
    res.json({files: file.files});
  });
});

UsersRoute.post('/users', (req, res)=>{
  var newUser = new User(req.body);
  newUser.save((err, user)=>{
    res.json(user);
  });
});

UsersRoute.post('/users/:id/files', (req, res)=>{
  var idUser = req.params.id;
  User.findOne({_id: idUser}, (err, user)=>{
    s3.createBucket({Bucket: 'sawabucket'},()=>{
      var params = {Bucket: 'sawabucket', Key: user.user, Body: JSON.stringify(user)};
      s3.upload(params, (err, data)=>{
        if(err){
          return console.log('AWS err here : ' + err);
        }
        console.log('Successfully uploaded data : ' + JSON.stringify(data));
        res.json(data);
      });
      var url = s3.getSignedUrl('getObject', {Bucket: 'sawabucket', Key: user.user});
      var newFile = new File({url: url});
      newFile.save((err, file)=>{
        if(err){
          return console.log('AWS error : ' + err);
        }
        res.json(file);
      });
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

UsersRoute.put('/users/:user/files/:file', (req, res)=>{
  var idUrl = req.params.id;
  var idFile = req.url.split('/');
  var updateData = {$push: {files: JSON.stringify(idFile[4])}};
  var query = {_id: idFile[2]};
  console.log(idFile[4]);
  console.log('params : ' + idFile[2]);
  User.update(query, updateData,(err, data)=>{
    console.log('Here is : ' + JSON.stringify(data));
    res.json(data);
    res.end();
  });
});

UsersRoute.delete('/users/:id', (req, res)=>{
  console.log('here is delete request on /users');
  var idUrl = req.params.id;
  // User.findOne({_id: idUrl}, (err, user)=>{
  //   if(err){
  //     return res.json({msg: 'There was an err findind data'});
  //   }
  //   File.findOne({_id: user.files}, (err, file)=>{
  //     console.log(file.url);
  //     var params = {Bucket: 'sawabucket', EncodingType : JSON.parse(file.url)}
  //     s3.listObjects(params, (err, data)=>{
  //       console.log(data);
  //     });
  //   });
  // });
  // File.remove({_id: idUrl}, (err, file)=>{
  //   console.log('removed!');
  // });


  // User.update({_id: idUrl}, {$set: {files: []}},(err, data)=>{
  //   if(err){
  //     console.log('Not updated : ' + err);
  //     return;
  //   }
  //   console.log('No files data : ' + data);
  // });
  //
  //
  // User.remove({_id: idUrl}, (err, data)=>{
  //   if(err){
  //     return console.log('Error removing item : ' + err);
  //   }
  //   console.log('Item removed Successfully! ' +  data);
  //   res.send(data);
  //   res.end();
  // });
});

module.exports = UsersRoute;
