// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

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
