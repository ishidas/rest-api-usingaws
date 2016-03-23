'use strict';
let chai = require('chai');
let chaiHTTP = require('chai-http');
chai.use(chaiHTTP);

let request = chai.request;
let expect = chai.expect;
let mongoose = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/test';
// let User = require(__dirname + '/../models/userSchema');
// let File = require(__dirname + '/../models/filesSchema');
require('./../server');

describe('Integration test on delete /user/:id route',()=>{
  var testUser;
    // newUser.save((err, user)=>{
    //   if(err){
    //     console.log(err);
    //     return;
    //   }
    //   console.log('Successfully created a new user : ' + user );
    //   testUser = user;
    //   console.log(testUser);
    //   done();
  //   });
  // });
  after((done)=>{
    mongoose.connection.test.dropDatabase(()=>{
      done();
    });
  });
  it('should create respond back with a new user', (done)=>{
    testUser = {name: 'Otter'};
    request('localhost:3000')
    .post('/users')
    .send(testUser)
    .end((err, res)=>{
      debugger;
      expect(res.body).to.be.an('object');
      // expect(res.body).to.have.
      done();
    });
  // it('should respond back with res.body with no array of files', (done)=>{
  //   request('localhost:3000')
  //   .delete('/user/:id')
  //   .send()
  //   done();
  });
});
