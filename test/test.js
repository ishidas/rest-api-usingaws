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

describe('Integration routes',()=>{
  var testUser;
  var id;
  beforeEach((done)=>{
    testUser = {name: 'Otter'};
    request('localhost:3000')
    .post('/users')
    .send(testUser)
    .end((err, res)=>{
      console.log('test response sent');
      id = res.body._id;
      done();
    });
  });
  after((done)=>{
    mongoose.connection.collections['users'].drop(function(){
      console.log('collections dropped.');
      done();
    });
  });
  it('should create respond back with a new user', (done)=>{
    request('localhost:3000')
    .post('/users')
    .send(testUser)
    .end((err, res)=>{
      // debugger;
      expect(res.body).to.be.an('object');
      done();
    });
  });
  it('should update the user file array to be empty',(done)=>{
    request('localhost:3000')
    .delete('/users/'+ id)
    .end((err, res)=>{
      expect(res).to.be.o;
      done();
    });
  });
});
