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

//GET all users data
UsersRoute.get('/users', (req, res)=>{
  User.find({}, (err, user)=>{
    res.json(user);
  });
});

//GET a particular user by their ID
UsersRoute.get('/users/:id', (req, res)=>{
  var idUrl = req.params.id;
  User.findOne({_id: idUrl}, (err, user)=>{
    res.json(user);
  });
});

//GET all the files for a paticular user
UsersRoute.get('/users/:id/files', (req, res)=>{
  var id = req.params.id;
  // var query = req.url.split('/')[3];
  User.findOne({_id: id},(err, user)=>{
    if(err){
      return res.json({msg: err});
    }
    res.json(user.files);
  });
});

//GET a specific file from a specified user
UsersRoute.get('/users/:id/files/:file', (req, res)=>{
  var id = req.params.id;
  var fileId = req.url.split('/');
  User.findOne({_id: id }, (err, user)=>{
    File.findOne({_id: fileId[4] }, (err, file)=>{
      console.log(user);
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
          return res.json({msg: err});
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

//PUT adding file_id into a user
UsersRoute.put('/users/:id/files/:file', (req, res)=>{
  var id = req.params.id;
  var idFile = req.url.split('/')[4];
  var params = {Bucket: 'sawabucket', Key: idFile, Body: JSON.stringify(req.body)};
  var query = {_id: id};
  debugger;
  User.findOne(query, (err, user)=>{
    s3.deleteObject({Bucket: 'sawabucket', Key: idFile}, (err, data)=>{
      if(err){
        return res.json({msg: err});
      }
      console.log( 'successfully deleted Object data!  ' + data);
      s3.putObject(params, (err, obj)=>{
        var url = s3.getSignedUrl('getObject', {Bucket: 'sawabucket', Key: });
        console.log('Object added  : ' + JSON.stringify(obj));
        File.update({_id: idFile}, {url: url}, (err, file)=>{
          if(err){
            return res.json({msg: err});
          }
          File.findOne({_id: idFile}, (err, file2)=>{
            console.log('Updated User Info :  ' + user);
            res.json({msg: 'Successfully updated data  ' + JSON.stringify(file) + ' here is new data  ' + file2});
          });
        });//File update end
      });//s3 put obj end
    });//s3 delete end
  });//findOne end
});

//Updates/changes info for a patircular user
UsersRoute.put('/users/:id',(req, res)=>{
  var id = req.params.id;
  var updateData = {$set: {user: req.body.user }};
  console.log('Here is New incoming data :  ' + JSON.stringify(updateData));
  User.findOneAndUpdate({_id: id}, updateData,{new: true}, (err, user)=>{
    if(err){
      return res.json({msg: 'Not updated.'});
    }
    res.json(user);
  });
});

//DELETE files from s3 and User specified
UsersRoute.delete('/users/:id', (req, res)=>{
  var id = req.params.id;
  User.findOne({_id: id},(err, user)=>{
    var filesArr = user.files;
    if(filesArr.length > -1){
      filesArr.forEach((data)=>{
        s3.deleteObjects({Bucket: 'sawabucket', Delete:{ Objects:[{Key: JSON.stringify(data) }]}}, (err, obj)=>{
          if(err){
            return res.json({msg: 'AWS error  ' + err});
          }
          console.log('Successfully deleted your objects!! ' + JSON.stringify(obj));
        });
      });
      user.remove();
      return res.json({msg: 'Specified user and files have been removed from db!!'});
    }
    user.remove();
    res.json({msg: 'Specified user has been removed from db!!'});
  });
});

//DELETE a specified file from s3, pull that out of User ref, and remove file from db
UsersRoute.delete('/users/:id/files/:file', (req, res)=>{
  console.log('here is delete request on /users');
  var id = req.params.id;
  var urlId = req.url.split('/')[4];
  var param = {Bucket: 'sawabucket', Delete: { Objects: [ {Key: urlId} ]}};
  s3.deleteObjects(param, (err, data)=>{
    console.log(data);
  });
  User.findOneAndUpdate({_id: id},{$pull: {files: urlId}},(err, user)=>{
    console.log(user);
  });
  File.remove({_id: urlId }, (err, file)=>{
    res.json({msg: 'removed! ' + file});
  });
  File.findOne({_id: urlId}, (err, file)=>{
    if(err){
      return console.log('No such file exist : ' + err);
    }
    console.log('File is still in db  : ' + file);
  });
});

module.exports = UsersRoute;
