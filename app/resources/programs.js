// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var _ = require('underscore'),
    util = require('../lib/util'),
    Program = require('../models/Program');

module.exports = function(app)
{
  app.resource('programs', {
    index: function(req, res)
    {
      app.programs.getBy(null, function(err, programs)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        res.send(programs);
      });
    },
    create: function(req, res, next)
    {
      var program = new Program(app);
      
      program.set(req.body || {}).save(function(err, program)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        res.send(program, 201);
      });
    },
    update: function(req, res)
    {
      app.programs.getById(req.param('program'), function(err, program)
      {
        if (err)
        {
          return res.send(404);
        }
        
        program.set(req.body || {}).save(function(err, changes)
        {
          if (err)
          {
            return res.send(err, 400);
          }
          
          res.send(program);
        });
      });
    },
    destroy: function(req, res, next)
    {
      app.programs.getById(req.param('program'), function(err, program)
      {
        if (err)
        {
          return res.send(404);
        }
        
        program.destroy(function(err, id)
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
