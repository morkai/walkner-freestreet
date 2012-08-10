var fs = require('fs'),
    express = require('express'),
    Resource = require('express-resource'),
    initDir = require('../lib/util').initDir;

module.exports = function(app, next)
{
  var port = 82,
      publicDir = __dirname + '/../../public/',
      routesDir = __dirname + '/../routes/',
      resourcesDir = __dirname + '/../resources/';
  
  app.configure(function()
  {
    app.use(express.cookieParser());
    app.use(express.session({secret: "~`z@!#X!@:>#x21\"4va"}));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express['static'](publicDir));
    app.set('views', __dirname + '/../views/');
    app.set('view options', {
      open: '{{',
      close: '}}'
    });
  });
  
  app.configure('development', function()
  {
    app.use(express.errorHandler({dumpExceptions: true, showStack: true})); 
  });
  
  app.configure('production', function()
  {
    app.use(express.errorHandler()); 
  });
  
  app.listen(port);
  
  initDir(routesDir, app);
  initDir(resourcesDir, app);
  
  console.log('Express server listening on port [%d]', port);
  
  next();
};
