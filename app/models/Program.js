var inherits = require('util').inherits,
    _ = require('underscore'),
    Model = require('./Model');

var Program = module.exports = function(app, doc)
{
  this.namespaceName = 'programs';
  this.collectionName = 'programs';
  this.defaults = {
    name: 'Program',
    source: []
  };
  this.setters = {
    name: String,
    source: function(val)
    {
      return val instanceof Array ? val : [];
    }
  };
  
  Model.call(this, app, doc);
};

inherits(Program, Model);