// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var Test = require('../models/Test');

module.exports = function(app, next)
{
  app.tests = {
    pending: {}
  };
  
  attachFunctions(app);
  subscribe(app);
  
  console.log('Tests module initialized');
  
  next();
};

function attachFunctions(app)
{
  var me = app.tests;
  
  me.getBy = function(filter, cb)
  {
    app.db.collection('tests', function(err, coll)
    {
      if (err)
      {
        return cb(err);
      }

      var tests = [];
      var cur = filter ? coll.find(filter) : coll.find();

      cur.each(function(err, doc)
      {
        if (err)
        {
          return cb(err);
        }

        if (doc)
        {
          tests.push(new Test(app, doc));
        }
        else
        {
          cb(null, tests);
        }
      });
    });
  };

  me.purge = function(days, cb)
  {
    app.db.collection('tests', function(err, coll)
    {
      coll.remove({startTime: {$lt: Date.now() - (days * 24 * 3600 * 1000)}}, cb);
    });
  };
}

function subscribe(app)
{
  app.broker.subscribe('tests.started', function(message)
  {
    var test = new Test(app, {
      tester: message.tester,
      startTime: Date.now(),
      programTime: message.programTime
    });

    app.programs.getById(message.program, function(err, program)
    {
      test.set({
        program: program.get('name'),
        source: program.get('source')
      });

      app.tests.pending[message.test] = test;
    });
  });
  
  app.broker.subscribe('tests.stopped', function(message)
  {
    var test = app.tests.pending[message.test];

    if (!test) return;

    delete app.tests.pending[message.test];

    test.set({
      status: message.status,
      endTime: Date.now()
    });
    test.save();
  });
  
  app.socket.sockets.on('connection', function(client)
  {
    client.broker.subscribe('tests.*', function(message, topic)
    {
      client.json.send({type: topic, data: message});
    });
  });
}
