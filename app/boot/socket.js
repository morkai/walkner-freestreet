var listen = require('socket.io').listen,
    initDir = require('../lib/util').initDir;

module.exports = function(app, next)
{
  var messagesDir = __dirname + '/../messages/';
  
  app.socket = listen(app);

  app.socket.configure(function()
  {
    app.socket.set('log level', 1);
    app.socket.enable('browser client minification');
    app.socket.enable('browser client etag');
    app.socket.enable('browser client gzip');
  });
  
  var messageHandlers = {};
  
  app.message = function(type, handler)
  {
    messageHandlers[type] = handler;
  };

  app.socket.sockets.on('connection', function(client)
  {
    client.broker = app.broker.sandbox();

    client.on('disconnect', onDisconnect.bind(null, client));
    client.on('message', onMessage.bind(null, client));
  });

  function onDisconnect(client)
  {
    client.broker.destroy();

    delete client.broker;
  }
  
  function onMessage(client, message)
  {
    if (typeof message !== 'object' || typeof message.type !== 'string')
    {
      return;
    }
    
    if (!messageHandlers.hasOwnProperty(message.type))
    {
      return;
    }
    
    var respond = message.hasOwnProperty('id')
            ? function(data) { client.json.send({id: message.id, type: message.type, data: data}); }
            : function() {};

    messageHandlers[message.type](respond, client, message.data);
  }
  
  initDir(messagesDir, app);
  
  console.log('Socket.IO server listening');
  
  next();
};
