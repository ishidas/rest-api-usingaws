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

//GET all users data
UsersRoute.get('/users', (req, res)=>{
  User.find({}, (err, user)=>{
    res.json(user);
    res.end();
  });
});

//GET a particular user by their ID
UsersRoute.get('/users/:id', (req, res)=>{
  var idUrl = req.params.id;
  User.find({_id: idUrl}, (err, user)=>{
    res.json(user);
    res.end();
  });
});

//GET all the files for a paticular user
UsersRoute.get('/users/:id/files', (req, res)=>{
  var id = req.params.id;
  // var query = req.url.split('/')[3];
  User.findOne({_id: id},(err, file)=>{
    res.json(file.files);
  });
});

//GET a specific file from a specified user
UsersRoute.get('/users/:id/files/:file', (req, res)=>{
  var id = req.params.id;
  var fileId = req.url.split('/');
  User.findOne({_id: id }, (err, user)=>{
    File.findOne({_id: fileId[4] }, (err, file)=>{
      console.log(file);
      res.json(file);
    });
  });
});

//POST new user data (data only no files)
UsersRoute.post('/users', (req, res)=>{
  var newUser = new User(req.body);
  newUser.save((err, user)=>{
    res.json(user);
  });
});

//POST a file
UsersRoute.post('/users/:id/files', (req, res)=>{
  var idUser = req.params.id;
  var body = req.body;
  var newFile = new File();

  newFile.save((err, file)=>{
    if(err){
      return res.json({msg: 'new file created'});
    }
    User.findOne({_id: idUser},function(err, user){
      user.files.push(file._id);
      user.save();
    });
    User.findOne({_id: idUser},function(err, user){
      console.log(user);
    });
    s3.createBucket({Bucket: 'sawabucket'},()=>{
      var params = {Bucket: 'sawabucket', Key: JSON.stringify(file._id), Body: JSON.stringify(body)};
      s3.upload(params, (err, data)=>{
        if(err){
          return console.log('AWS err here : ' + err);
        }
        console.log('Successfully uploaded data : ' + JSON.stringify(data));
        //next time, use this below command instead og grabbing url inside upload
        var urlaws = s3.getSignedUrl('getObject', {Bucket: 'sawabucket', Key: JSON.stringify(file._id)});
        console.log('Here is AWS URL :  ' + urlaws);
        File.update({_id: file._id}, {url: urlaws }, (err, file)=>{
          console.log('Here is file!!!  : ' + file);
        });
        File.findOne({_id: file._id},(err, data)=>{
          res.json(data);
        });
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

//adding file_id into a user
UsersRoute.put('/users/:id/files/:file', (req, res)=>{
  var id = req.params.id;
  var idFile = req.url.split('/');
  var updateData = {$push: {files: idFile[4]}};
  var query = {_id: id};
  console.log(idFile[4]);
  console.log('params : ' + idFile[2]);
  User.findOneAndUpdate(query, updateData,(err, data)=>{
    res.json(data);
    res.end();
  });
});

//Updates/changes info for a patircular user
UsersRoute.put('/users/:id',(req, res)=>{
  var id = req.params.id;
  var updateData = {user: req.body.user };
  console.log(updateData);
  User.findOneAndUpdate({_id: id}, updateData, (err, user)=>{
    res.json(user);
  });
});

// UsersRoute.put('/users/:id/files/:file', (req, res)=>{
//   var id = req.params.id;
//   var fileId = req.url.split('/');
//   var params = {Bucket: 'sawabucket', {Key: }}
//
// });

UsersRoute.delete('/users/:id/files/:file', (req, res)=>{
  console.log('here is delete request on /users');
  var id = req.params.id;
  var urlId = req.url.split('/');

  // User.findOneAndUpdate({_id: id},{$pull: {files: urlId[4]}},(err, user)=>{
  //   console.log(user);
  //   res.end();
  // });
  File.findOne({_id: urlId[4]},(err, user)=>{
    var param = {Bucket: 'sawabucket', EncodingType: user.url };
    console.log(user.url);
    s3.listObjects(param, (err, data)=>{
      data.remove();
    });
    res.end();
  });
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
