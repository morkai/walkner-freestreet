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
