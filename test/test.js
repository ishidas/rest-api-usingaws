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
var testUser = {user: 'Otter'};
var testFile = {myNote: 'Otter is the cutest animal.'};
var id;
var newFileId;

describe('Integration test for routes',()=>{
  after((done)=>{
    mongoose.connection.db.dropDatabase();
    done();
  });
  it('should POST a new user in db', (done)=>{
    request('localhost:3000')
    .post('/users')
    .send(testUser)
    .end((err, res)=>{
      expect(err).to.be.null;
      expect(res.body).to.be.an('object');
      expect(res.body._id).to.have.a('string');
      expect(res.body).to.have.property('user');
      done();
    });
  });
  it('should get all users from data base', (done)=>{
    request('localhost:3000')
    .get('/users')
    .end((err, res)=>{
      expect(err).to.be.null;
      expect(res.body).to.have.an('array');
      expect(res.body[0]).to.have.an('Object');
      expect(res.body[0]).to.have.a.property('user');
      done();
    });
  });
});
