var createHash = require('crypto').createHash,
    _ = require('underscore'),
    util = require('../lib/util'),
    User = require('../models/User');

module.exports = function(app)
{
  var salt = 't3st3r';
  
  app.resource('users', {
    index: function(req, res)
    {
      app.users.getBy(null, function(err, users)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        res.send(users);
      });
    },
    create: function(req, res, next)
    {
      var user = new User(app);
      
      var data = req.body || {};
      
      data.salt     = createHash('md5').update((new Date().getTime() + Math.random()).toString()).digest('hex');
      data.password = createHash('md5').update(salt + data.password1 + data.salt).digest('hex');
      
      delete data.password1;
      delete data.password2;
      
      user.set(data).save(function(err, user)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        res.send(user, 201);
      });
    },
    update: function(req, res)
    {
      var data = req.body;
      
      if ('password1' in data && data.password1.length)
      {
        data.salt     = createHash('md5').update((new Date().getTime() + Math.random()).toString()).digest('hex');
        data.password = createHash('md5').update(salt + data.password1 + data.salt).digest('hex');
      }
      
      delete data.password1;
      delete data.password2;
      
      app.users.getById(req.param('user'), function(err, user)
      {
        if (err)
        {
          return res.send(404);
        }
        
        user.set(data).save(function(err, changes)
        {
          if (err)
          {
            return res.send(err, 400);
          }
          
          res.send(user);
        });
      });
    },
    destroy: function(req, res, next)
    {
      app.users.getById(req.param('user'), function(err, user)
      {
        if (err)
        {
          return res.send(404);
        }
        
        user.destroy(function(err, id)
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
