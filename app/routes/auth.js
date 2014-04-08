// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var createHash = require('crypto').createHash;

module.exports = function(app)
{
  var salt = 't3st3r';
  
  app.post('/login', function(req, res)
  {
    var credentials = req.body;
    
    app.users.getBy(
      function(user)
      {
        var password = createHash('md5').update(salt + credentials.password + user.get('salt')).digest('hex');

        return user.get('email') === credentials.login && user.get('password') === password;
      },
      function(err, users)
      {
        if (err || users.length === 0)
        {
          return res.send(401);
        }
        
        req.session.user = users[0].toJSON();
        
        return res.send(users[0], 200);
      }
    );
  });
  
  app.post('/logout', function(req, res)
  {
    delete req.session.user;
    
    res.send(200);
  });
};
