var inherits = require('util').inherits,
    Model = require('./Model');

var Test = module.exports = function(app, doc)
{
  this.namespaceName = 'tests';
  this.collectionName = 'tests';
  this.defaults = {
    tester: '',
    program: '',
    source: [],
    startTime: 0,
    endTime: 0,
    programTime: 0,
    status: 'unknown'
  };
  this.setters = {
    tester: String,
    program: String,
    source: function(val) { return Array.isArray(val) ? val : []; },
    startTime: Number,
    endTime: Number,
    programTime: Number,
    elapsedTime: Number,
    status: String
  };
  
  Model.call(this, app, doc);
};

inherits(Test, Model);