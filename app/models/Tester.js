var inherits = require('util').inherits,
    fork = require('child_process').fork,
    _ = require('underscore'),
    Model = require('./Model');

var Tester = module.exports = function(app, doc)
{
  var me = this;
  
  me.namespaceName = 'testers';
  me.collectionName = 'testers';
  me.defaults = {
    model: app.testers.config.defaultModel,
    name: 'Tester',
    type: 'tcp',
    unit: 0,
    host: '127.0.0.1',
    port: 502,
    path: '/dev/ttyS0',
    baudRate: 9600,
    dataBits: 7,
    stopBits: 1,
    parity: 2,
    program1: '',
    program2: ''
  };
  me.setters = {
    name: String,
    model: function(val)
    {
      return val in app.testers.config.models
        ? val
        : app.testers.config.defaultModel;
    },
    type: function(val)
    {
      return ['tcp', 'rtu', 'ascii'].indexOf(val) === -1 ? 'tcp' : val;
    },
    unit: function(val)
    {
      return val >= 0 && val <= 254 ? Number(val) : 0;
    },
    host: String,
    port: Number,
    path: String,
    baudRate: Number,
    dataBits: Number,
    stopBits: Number,
    parity: Number,
    program1: String,
    program2: String
  };
  
  Model.call(me, app, doc);
  
  me.state = {
    testing: false,
    program: 0,
    powerOn: false,
    greenLed: false,
    orangeLed: false,
    redLed: false,
    startLed: false
  };
  
  me.worker = null;
  me.workerTimeout = null;

  process.nextTick(function() { me.start(); });
  
  _.bindAll(me, 'onConnect');
  
  me.app.socket.sockets.on('connection', me.onConnect);
};

inherits(Tester, Model);

Tester.messageHandlers = {};

Tester.prototype.isTesting = function()
{
  return this.state.testing;
};

Tester.prototype.toJSON = function()
{
  return _.extend(Model.prototype.toJSON.call(this), this.state);
};

Tester.prototype.start = function()
{
  var me = this;
  
  me.worker = fork(__dirname + '/../tester.js');
  me.worker.on('message', me.onWorkerMessage.bind(me));
  me.worker.on('error', me.onWorkerError.bind(me));
  
  var tester = {type: me.get('type')},
      slave = me.app.testers.config.models[me.get('model')],
      properties = ['name', 'unit'];
  
  if (tester.type === 'tcp')
  {
    properties.push('host', 'port');
  }
  else
  {
    properties.push('path', 'baudRate', 'dataBits', 'stopBits', 'parity');
  }
  
  properties.forEach(function(property) { tester[property] = me.get(property); });
  
  me.worker.send({
    type: 'initialize',
    data: {
      tester: tester,
      slave: slave
    }
  });
};

Tester.prototype.onWorkerMessage = function(message)
{
  if ('type' in message && message.type in Tester.messageHandlers)
  {
    Tester.messageHandlers[message.type].call(this, message.data);
  }
};

Tester.prototype.onWorkerError = function(err)
{
  console.error(err.message);
};

Tester.prototype.onConnect = function(client)
{
  var me = this;
  
  me.broker.publish('testers.updated', {
    id: me.get('id'),
    changes: me.state
  });
};

Tester.prototype.onUpdate = function(changes)
{
  var me = this;

  if ('program1' in changes || 'program2' in changes)
  {
    return me.program();
  }

  if (me.worker)
  {
    me.onFinalized = me.start.bind(me);
    
    me.worker.send({
      type: 'finalize'
    });
  }
};

Tester.prototype.onDestroy = function(done)
{
  var me = this;
  
  me.app.socket.sockets.removeListener('connection', me.onConnect);
  
  if (me.worker)
  {
    me.onFinalized = done;
    
    me.worker.send({
      type: 'finalize'
    });
  }
  else
  {
    done();
  }
};

Tester.prototype.program = function(cb)
{
  cb = cb || function() {};
  
  var me = this;
  
  if (!me.worker)
  {
    return cb();
  }
  
  if (me.isTesting())
  {
    return cb(new Error('Cannot program tester while a test is in progress.'));
  }
  
  me.app.programs.getById(me.get('program1'), function(err, program1)
  {
    if (!err)
    {
      program1 = {
        id: program1.get('id'),
        name: program1.get('name'),
        source: program1.get('source')
      };
    }
    
    me.app.programs.getById(me.get('program2'), function(err, program2)
    {
      if (!err)
      {
        program2 = {
          id: program2.get('id'),
          name: program2.get('name'),
          source: program2.get('source')
        };
      }
      
      me.worker.send({
        type: 'program',
        data: {
          program1: program1,
          program2: program2
        }
      });
      
      cb();
    });
  });
};

Tester.messageHandlers.initialized = function()
{
  var me = this,
      model = me.app.testers.config.models[me.get('model')] || {name: '?'},
      name = me.get('name');
  
  console.log('Tester [%s] initialized as [%s]', name, model.name);
  
  me.program();

  me.worker.send({
    type: 'ping'
  });
};

Tester.messageHandlers.finalized = function()
{
  var me = this;
  
  console.log('Tester [%s] finalized', me.get('name'));
  
  if (me.worker)
  {
    me.worker.kill();
  }
  
  if (me.onFinalized)
  {
    me.onFinalized();
    me.onFinalized = null;
  }
};

Tester.messageHandlers.stateChanged = function(newState)
{
  var me = this,
      changes = {},
      changed = false;
  
  for (var property in newState)
  {
    var value = newState[property];
    
    if (property in me.state && me.state[property] != value)
    {
      me.state[property] = value;
      changes[property] = value;
      changed = true;
    }
  }
  
  if (changed)
  {
    me.broker.publish('testers.updated', {
      id: me.get('id'),
      changes: changes
    });
  }
};

Tester.messageHandlers.programChanged = function(message)
{
  var me = this,
      newProgram = message.newProgram;
  
  Tester.messageHandlers.stateChanged.call(me, {program: newProgram});
};

Tester.messageHandlers.testStarted = function(message)
{
  var me = this;
  
  message.tester = me.get('name');
  message.program = me.get('program' + message.program);

  me.broker.publish('tests.started', message);
  
  Tester.messageHandlers.stateChanged.call(me, {testing: true});
};

Tester.messageHandlers.testStopped = function(message)
{
  var me = this;

  me.broker.publish('tests.stopped', message);
  
  Tester.messageHandlers.stateChanged.call(me, {testing: false});
};

Tester.messageHandlers.progress = function(message)
{
  var me = this;
  
  message.id = me.get('id');
  
  me.broker.publish('testers.progress', message);
};

Tester.messageHandlers.connected = function()
{
  Tester.messageHandlers.stateChanged.call(this, {
    greenLed: 1
  });
};

Tester.messageHandlers.disconnected = function()
{
  Tester.messageHandlers.stateChanged.call(this, {
    redLed: 1,
    greenLed: 0
  });
};

Tester.messageHandlers.pong = function()
{
  var me = this;

  clearTimeout(me.workerTimeout);

  setTimeout(function()
  {
    if (me.worker)
    {
      me.worker.send({type: 'ping'});

      me.workerTimeout = setTimeout(function()
      {
        if (me.worker)
        {
          me.worker.kill();
          me.start();
        }
      }, 6000);
    }
  }, 5000);
};
