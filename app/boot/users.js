var User = require('../models/User');

module.exports = function(app, next)
{
  app.users = {
    map: {}
  };
  
  attachFunctions(app);
  subscribe(app);
  loadUsers(app);
  
  console.log('Users module initialized');
  
  next();
};

function attachFunctions(app)
{
  var me = app.users;
  
  me.getById = function(id, cb)
  {
    if (id in me.map)
    {
      cb(null, me.map[id]);
    }
    else
    {
      cb(new Error('Żądany użytkownik nie istnieje.'));
    }
  };
  
  me.getBy = function(filter, cb)
  {
    var result = [],
        id,
        user;
    
    for (id in me.map)
    {
      user = me.map[id];
      
      if (!filter || filter(user))
      {
        result.push(user);
      }
    }
    
    cb(null, result);
  };
}

function subscribe(app)
{
  app.broker.subscribe('users.created', function(user)
  {
    app.users.map[user.get('id')] = user;
  });
  
  app.broker.subscribe('users.destroyed', function(id)
  {
    if (id in app.users.map)
    {
      delete app.users.map[id];
    }
  });
  
  app.socket.sockets.on('connection', function(client)
  {
    client.broker.subscribe('users.*', function(message, topic)
    {
      client.json.send({type: topic, data: message});
    });
  });
}

function loadUsers(app)
{
  app.db.collection('users', function(err, coll)
  {
    if (err)
    {
      throw err;
    }

    var userCount = 0;
    
    coll.find().each(function(err, doc)
    {
      if (err)
      {
        throw err;
      }
      
      if (doc)
      {
        ++userCount;

        app.users.map[doc._id.toHexString()] = new User(app, doc);
      }
      else if (userCount === 0)
      {
        process.nextTick(createDefaultSuperUser);
      }
    });
  })
}

function createDefaultSuperUser()
{
  new User(app, {
    name: 'Walkner',
    email: 'walkner@walkner.pl',
    salt: '~`l0l`~',
    password: 'f20737eafd54b89679e51720cd7edd67',
    role: 'admin'
  }).save();
}
