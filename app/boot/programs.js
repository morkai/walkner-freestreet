var Program = require('../models/Program');

module.exports = function(app, next)
{
  app.programs = {
    map: {}
  };
  
  attachFunctions(app);
  subscribe(app);
  loadPrograms(app);
  
  console.log('Programs module initialized');
  
  next();
};

function attachFunctions(app)
{
  var me = app.programs;
  
  me.getById = function(id, cb)
  {
    if (id in me.map)
    {
      cb(null, me.map[id]);
    }
    else
    {
      cb(new Error('Żądany program nie istnieje.'));
    }
  };
  
  me.getBy = function(filter, cb)
  {
    var result = [],
        id,
        program;
    
    for (id in me.map)
    {
      program = me.map[id];
      
      if (!filter || filter(program))
      {
        result.push(program);
      }
    }
    
    cb(null, result);
  };
}

function subscribe(app)
{
  app.broker.subscribe('programs.created', function(program)
  {
    app.programs.map[program.get('id')] = program;
  });
  
  app.broker.subscribe('programs.destroyed', function(id)
  {
    if (id in app.programs.map)
    {
      delete app.programs.map[id];
    }
  });
  
  app.socket.sockets.on('connection', function(client)
  {
    client.broker.subscribe('programs.*', function(message, topic)
    {
      client.json.send({type: topic, data: message});
    });
  });
}

function loadPrograms(app)
{
  app.db.collection('programs', function(err, coll)
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
        app.programs.map[doc._id.toHexString()] = new Program(app, doc);
      }
    })
  })
}
