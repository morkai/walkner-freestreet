// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var mongodb = require('mongodb');

module.exports = function(app, next)
{
  var name = 'walkner-tester',
      host = '127.0.0.1',
      port = 27017;
  
  app.db = new mongodb.Db(
    name,
    new mongodb.Server(host, port, {strict: true, auto_reconnect: true}),
    {native_parser: false}
  );
  
  app.db.open(function(err)
  {
    if (err)
    {
      throw err;
    }
    
    console.log('Connected to database [%s] on [%s:%d]', name, host, port);
    
    next();
  });
};
