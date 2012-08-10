var inherits = require('util').inherits,
    _ = require('underscore'),
    Model = require('./Model');

var User = module.exports = function(app, doc)
{
  this.namespaceName = 'users';
  this.collectionName = 'users';
  this.defaults = {
    name: 'Gall Anonim',
    email: 'someone@the.net',
    password: '',
    salt: '',
    role: 'user'
  };
  this.setters = {
    name: String,
    email: String,
    password: String,
    salt: String,
    role: String
  };
  
  Model.call(this, app, doc);
};

inherits(User, Model);

User.prototype.toJSON = function()
{
  var obj = Model.prototype.toJSON.call(this);
  
  delete obj.password;
  delete obj.salt;
  
  return obj;
};