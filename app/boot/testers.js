// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var Tester = require('../models/Tester');

module.exports = function(app, next)
{
  app.testers = {
    map: {},
    config: require('../config/testers')
  };
  
  attachFunctions(app);
  subscribe(app);
  loadTesters(app);
  
  console.log('Testers module initialized');
  
  next();
};

function attachFunctions(app)
{
  var me = app.testers;
  
  me.getById = function(id, cb)
  {
    if (id in me.map)
    {
      cb(null, me.map[id]);
    }
    else
    {
      cb(new Error('Żądany tester nie istnieje.'));
    }
  };
  
  me.getBy = function(filter, cb)
  {
    var result = [],
        id,
        tester;
    
    for (id in me.map)
    {
      tester = me.map[id];
      
      if (!filter || filter(tester))
      {
        result.push(tester);
      }
    }
    
    cb(null, result);
  };
}

function subscribe(app)
{
  app.broker.subscribe('testers.created', function(tester)
  {
    app.testers.map[tester.get('id')] = tester;
  });
  
  app.broker.subscribe('testers.destroyed', function(id)
  {
    if (id in app.testers.map)
    {
      delete app.testers.map[id];
    }
  });
  
  app.socket.sockets.on('connection', function(client)
  {
    client.broker.subscribe('testers.*', function(message, topic)
    {
      client.json.send({type: topic, data: message});
    });
  });
}

function loadTesters(app)
{
  app.db.collection('testers', function(err, coll)
  {
    if (err)
    {
      throw err;
    }
    
    coll.find().each(function(err, doc)
    {
      if (err)
      {
        throw err;
      }
      
      if (doc)
      {
        app.testers.map[doc._id.toHexString()] = new Tester(app, doc);
      }
    })
  })
}
