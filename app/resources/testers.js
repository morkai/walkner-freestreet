var _ = require('underscore'),
    util = require('../lib/util'),
    Tester = require('../models/Tester');

module.exports = function(app)
{
  app.resource('testers', {
    index: function(req, res)
    {
      app.testers.getBy(null, function(err, testers)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        res.send(testers);
      });
    },
    create: function(req, res, next)
    {
      var tester = new Tester(app);
      
      tester.set(req.body || {}).save(function(err, tester)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        res.send(tester, 201);
      });
    },
    update: function(req, res)
    {
      app.testers.getById(req.param('tester'), function(err, tester)
      {
        if (err)
        {
          return res.send(404);
        }
        
        if (tester.isTesting())
        {
          return res.send(400);
        }
        
        tester.set(req.body || {}).save(function(err, changes)
        {
          if (err)
          {
            return res.send(err, 400);
          }
          
          res.send(tester);

          if (('program1' in req.body || 'program2' in req.body) && !('program1' in changes || 'program2' in changes))
          {
            tester.program();
          }
        });
      });
    },
    destroy: function(req, res, next)
    {
      app.testers.getById(req.param('tester'), function(err, tester)
      {
        if (err)
        {
          return res.send(404);
        }
        
        if (tester.isTesting())
        {
          return res.send(400);
        }
        
        tester.destroy(function(err, id)
        {
          if (err)
          {
            return res.send(err, 400);
          }
          
          res.send({success: true});
        });
      });
    }
  });
};
