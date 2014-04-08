// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var _ = require('underscore'),
    util = require('../lib/util'),
    Test = require('../models/Test');

module.exports = function(app)
{
  app.resource('tests', {
    index: function(req, res)
    {
      app.tests.getBy(null, function(err, tests)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        res.send(tests);
      });
    }
  });
};
