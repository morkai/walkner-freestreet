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
