'use strict';
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  user: String,
  files: [{type: mongoose.Schema.Types.ObjectId,
            ref: 'File'
  }]
});

let User = mongoose.model('User', UserSchema);
module.exports = User;
