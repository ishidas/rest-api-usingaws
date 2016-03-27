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
var fileId;

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
      id = res.body._id;
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
  it('should POST files into a specified user', (done)=>{
    request('localhost:3000')
    .post('/users/' + id + '/files')
    .send(testFile)
    .end((err, res)=>{
      fileId = res.body._id;
      expect(err).to.be.null;
      expect(res.body).to.be.an('Object');
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('url');
      done();
    });
  });
  it('should GET a specified user', ()=>{
    request('localhost:3000')
    .get('/users/' + id)
    .end((err, res)=>{
      expect(err).to.be.null;
      expect(res.body).to.have.property('user');
      expect(res.body).to.have.property('files');
    });
  });
  it('should GET a speified file from a specific user', (done)=>{
    request('localhost:3000')
    .get('/users/' + id + '/files/' + fileId)
    .end((err, res)=>{
      expect(err).to.be.null;
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('url');
      done();
    });
  });
  it('shoul PUT new ')
});
