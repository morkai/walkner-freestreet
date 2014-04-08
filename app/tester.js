// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

//console.log = function() {};
//console.error = function() {};

var progressIntervalMs = 750;

var _ = require('underscore'),
    BufferReader = require(__dirname + '/lib/h5.buffers/lib').BufferReader,
    modbus = require(__dirname + '/lib/h5.modbus/lib'),
    compile = require(__dirname + '/lib/operations').compile;

var messageHandlers = {
  initialize: initialize,
  finalize: finalize,
  program: program,
  ping: ping
};

var master,
    slave,
    tester;

var state = {
      wasConnected: false,
      needsReset: false,
      ledsBlinking: false,
      start: 0,
      stop: 0,
      program1: 0,
      program2: 0,
      powerOn: 0,
      greenLed: 0,
      orangeLed: 0,
      redLed: 0,
      startLed: 0
    },
    context = {
      test: null,
      running: false,
      paused: false,
      resume: null,
      loops: {},
      totalTime: 0,
      flatTime: 0,
      pwmValue: 0
    },
    progressInterval;

process.on('message', function(message)
{
  if (message.type in messageHandlers)
  {
    messageHandlers[message.type](message.data);
  }
});

process.on('uncaughtException', onError);

function initialize(message)
{
  tester = message.tester;
  slave = message.slave;
  
  setUpSlave();
  setUpMaster();
  setUpTransactions();
  
  master.connect();
  
  process.send({
    type: 'initialized'
  });
}

function finalize(silent)
{
  function finalized()
  {
    if (!silent)
    {
      process.send({
        type: 'finalized'
      });
    }
  }
  
  stopTest(function()
  {
    if (master && master.isConnected())
    {
      setLeds({green: 0}, function()
      {
        master
          .once('disconnect', function() { master = null; })
          .disconnect();
        
        finalized();
      });
    }
    else
    {
      finalized();
    }
  }, 'shutdown');
}

function program(message)
{
  var program1 = message.program1 || {},
      program2 = message.program2 || {};
  
  tester.program1 = _.isArray(program1.source)
    ? compile(message.program1.source) : null;
  
  tester.program2 = _.isArray(program2.source)
    ? compile(program2.source) : null;
  
  console.log(
    'Programmed [%s] tester with [%s] and [%s] programs',
    tester.name,
    program1.name,
    program2.name
  );

  process.send({
    type: 'programmed'
  });
}

function ping()
{
  process.send({
    type: 'pong'
  });
}

function setUpSlave()
{
  context.PWM_MAX_VALUE  = slave.pwmMaxValue;
  context.PWM_OFF_VALUE  = slave.pwmOffValue;
  context.PWM_ADDRESS    = slave.pwmAddress;
  context.BEEPER_ADDRESS = slave.beeperAddress;
}

function setUpMaster()
{
  var defaults = {
    autoConnect: false,
    autoReconnect: true,
    maxConcurrentRequests: 1,
    maxRetries: 3,
    maxTimeouts: 10,
    timeout: 50
  };
  
  master = modbus.createMaster(_.extend(defaults, slave, tester));
  
  master
    .on('connect', onConnect)
    .on('disconnect', onDisconnect)
    .on('error', onError);
}

function setUpTransactions()
{
  master.addTransaction({
    id: 'keepAlive',
    fn: 5,
    address: slave.keepAliveAddress,
    value: 1,
    interval: 2500
  });
  
  master.addTransaction({
    id: 'inputs',
    fn: 2,
    address: slave.inputsAddress,
    quantity: 5,
    interval: 100,
    handler: createIoHandler([
      'start', 'stop', 'program1', 'program2', 'powerOn'
    ])
  });
  
  master.addTransaction({
    id: 'outputs',
    fn: 1,
    address: slave.outputsAddress,
    quantity: 4,
    interval: 100,
    handler: createIoHandler([
      'redLed', 'orangeLed', 'greenLed', 'startLed'
    ])
  });
}

function onConnect()
{
  console.log('Connected to master on [%s] tester', tester.name);

  process.send({
    type: 'connected'
  });
  
  resetLeds();
  
  if (context.running && context.paused)
  {
    context.paused = false;
    
    if (_.isFunction(context.resume))
    {
      process.nextTick(context.resume);
    }
  }
  
  state.wasConnected = true;

  setTimeout(function()
  {
    if (master && master.isConnected())
    {
      setLeds({green: 1});
    }
  }, 2500);
}

function onDisconnect()
{
  if (state.wasConnected)
  {
    console.log('Disconnected from master on [%s] tester', tester.name);

    process.send({
      type: 'disconnected'
    });
  }
  
  if (context.running && !context.paused)
  {
    context.paused = true;
  }
  
  state.wasConnected = false;
}

function onError(err)
{
  if (err.syscall === 'connect')
  {
    return;
  }
  
  console.error('Error from [%s] tester:\n%s', tester.name, err.stack);
  
  stopTest(null, 'error');
}

function onTestEnd(program, programTime, startTime)
{
  var elapsedTime = (Date.now() - startTime) / 1000;

  clearInterval(progressInterval);
  
  console.log(
    'Finished program [%d] on [%s] tester in [%d/%d] seconds',
    program,
    tester.name,
    elapsedTime,
    programTime 
  );
  
  var test = context.test;

  context.test = null;
  context.running = false;
  context.paused = false;
  context.resume = null;
  
  turnOffTheLights();
  setLeds({start: 0, orange: 0}, function()
  {
    blinkLed('orange');
  });

  process.send({
    type: 'testStopped',
    data: {
      test: test,
      status: 'finished'
    }
  });
}

function onStateChange(changes)
{
  process.send({
    type: 'stateChanged',
    data: changes
  });
  
  if ('program1' in changes || 'program2' in changes)
  {
    process.nextTick(changeProgram);
  }
  
  if ('start' in changes || 'stop' in changes)
  {
    process.nextTick(changeTestStatus);
  }
}

function startTest()
{
  console.log('Starting test on [%s] tester', tester.name);
  
  // Blink red LED if the system was not reset after last test.
  if (state.needsReset)
  {
    console.log('Can not start test on [%s]: needs reset', tester.name);
    
    return process.nextTick(function()
    {
      blinkLed('red');
    });
  }
  
  // Stop all blinking LEDs, if any, and then start test.
  if (state.ledsBlinking)
  {
    return process.nextTick(function()
    {
      stopBlinkingLeds(function()
      {
        process.nextTick(startTest);
      });
    });
  }
  
  // Ignore the operation if a test is already in progress.
  if (context.running)
  {
    console.log('Test is already in progress on [%s] tester', tester.name);
    
    return;
  }
  
  // Ignore the operation if no program was selected.
  if (tester.currentProgram === 0)
  {
    console.log('Can not start program 0 on [%s]', tester.name);
    
    return;
  }
  
  // Blink red LED if the selected program was not programmed.
  var program = tester['program' + tester.currentProgram];
  
  if (!program || !_.isFunction(program.execute))
  {
    console.log('Program [%d] on [%s] tester is not programmed', tester.currentProgram, tester.name);
    
    return process.nextTick(function()
    {
      blinkLed('red');
    });
  }
  
  // Set up the context
  context.test      = Date.now() + Math.random().toString();
  context.running   = true;
  context.paused    = false;
  context.resume    = null;
  
  context.loopsChanged = false;
  context.loops        = {};
  context.totalTime    = 0;
  context.flatTime     = 0;
  context.pwmValue     = 0;

  // Start executing the program
  program.execute(
    master,
    context,
    onTestEnd.bind(null, tester.currentProgram, program.totalTime, Date.now())
  );
  
  // Light orange and start LEDs.
  setLeds({orange: 1, start: 1});
  
  // System should be reset after starting a test.
  state.needsReset = true;
  
  console.log('Started program [%d] on [%s] tester', tester.currentProgram, tester.name);

  process.send({
    type: 'testStarted',
    data: {
      test: context.test,
      program: tester.currentProgram,
      programTime: program.totalTime
    }
  });
  
  progressInterval = setInterval(function()
  {
    var data = {
          totalTime: context.totalTime,
          flatTime: context.flatTime,
          pwmValue: 100 * context.pwmValue / context.PWM_MAX_VALUE
        };
    
    if (context.loopsChanged)
    {
      context.loopsChanged = false;
      
      data.loops = context.loops;
    }

    process.send({
      type: 'progress',
      data: data
    });
  }, progressIntervalMs);
}

function stopTest(done, reason)
{
  // Ignore the operation if no test is in progress.
  if (!context.running)
  {
    return _.isFunction(done) ? process.nextTick(done) : undefined;
  }
  
  clearInterval(progressInterval);
  
  console.log('Stopping test on [%s] tester', tester.name);
  
  var test = context.test;

  context.test = null;
  context.running = false;
  context.paused = false;
  context.resume = null;
  
  setLeds({orange: 0, start: 0, red: 1}, function()
  {
    blinkLed('red');
    turnOffTheLights(function()
    {
      console.log('Test on [%s] tester stopped', tester.name);
  
      if (_.isFunction(done))
      {
        process.nextTick(done);
      }

      process.send({
        type: 'testStopped',
        data: {
          test: test,
          status: reason || 'stopped'
        }
      });
    });
  });
}

function changeProgram(newProgram)
{
  var oldProgram = tester.currentProgram || 0;
  
  if (!_.isNumber(newProgram))
  {
    if (state.program1 && !state.program2)
    {
      newProgram = 1;
    }
    else if (!state.program1 && state.program2)
    {
      newProgram = 2;
    }
    else
    {
      newProgram = 0;
    }
  }
  
  if (oldProgram === newProgram)
  {
    return;
  }
  
  console.log('Program on [%s] tester changed from [%d] to [%d]', tester.name, oldProgram, newProgram);
  
  tester.currentProgram = newProgram;

  process.send({
    type: 'programChanged',
    data: {
      oldProgram: oldProgram,
      newProgram: newProgram
    }
  });
  
  if (newProgram === 0)
  {
    if (context.running)
    {
      stopTest(reset, 'shutdown');
    }
    else
    {
      reset();
    }
  }
}

function reset()
{
  stopBeeper(function()
  {
    stopBlinkingLeds(function()
    {
      state.needsReset = false;
    });
  });
}

var startPushedAt;

function changeTestStatus(newStatus)
{
  if (!_.isUndefined(newStatus))
  {
    return process.nextTick(newStatus ? startTest : stopTest);
  }

  if (state.start)
  {
    startPushedAt = Date.now();
  }
  else if (startPushedAt)
  {
    var startPushedFor = Date.now() - startPushedAt;

    startPushedAt = null;

    if (startPushedFor > 1000)
    {
      process.nextTick(startTest);
    }
  }
  else if (!state.stop)
  {
    process.nextTick(stopTest);
  }
}

function stopBeeper(done)
{
  master.executeRequest({
    fn: 5,
    address: context.BEEPER_ADDRESS,
    value: 0,
    handler: function(err)
    {
      process.nextTick(done);
    }
  });
}

function turnOffTheLights(done)
{
  master.executeRequest({
    fn: 6,
    address: slave.pwmAddress,
    value: slave.pwmOffValue,
    handler: function(err)
    {
      if (err)
      {
        throw new Error('Could not turn off the lamp.');
      }
      else if (done)
      {
        process.nextTick(done);
      }
    }
  });
}

var allLeds = {
      red: function() { return 0; },
      orange: function() { return context.running ? 1 : 0; },
      green: function() { return 1; },
      start: function() { return context.running ? 1 : 0; }
    },
    blinkingLeds = {};

function setLeds(leds, done)
{
  var values = [];

  _.keys(allLeds).forEach(function(led)
  {
    values.push(Boolean(led in leds ? leds[led] : state[led + 'Led']));
  });

  master.executeRequest({
    fn: 15,
    address: slave.ledsAddress,
    values: values,
    handler: function(err)
    {
      if (err)
      {
        throw new Error('Could not set LEDs.');
      }

      if (_.isFunction(done))
      {
        process.nextTick(done);
      }

      var changes = {};

      for (var led in leds)
      {
        changes[led + 'Led'] = state[led + 'Led'] = leds[led];
      }

      process.send({
        type: 'stateChanged',
        data: changes
      });
    }
  });
}

function resetLeds(done)
{
  var leds = {};

  for (var led in allLeds)
  {
    leds[led] = allLeds[led]();
  }

  setLeds(leds, done);
}

function blinkLed(led)
{
  if (led in blinkingLeds)
  {
    return;
  }

  state.ledsBlinking = true;

  var status = state[led + 'Led'],
      which = {},
      blinkingLed = {
        on: true,
        timeout: null
      };

  blinkingLeds[led] = blinkingLed;

  (function blink()
  {
    status = which[led] = status ? 0 : 1;

    setLeds(which, function()
    {
      if (blinkingLed.on)
      {
        blinkingLed.timeout = setTimeout(blink, 950);
      }
    });
  })();
}

function stopBlinkingLeds(done)
{
  var name,
      led;

  for (name in blinkingLeds)
  {
    led = blinkingLeds[name];

    clearTimeout(led.timeout);

    led.on = false;
    led.timeout = null;

    delete blinkingLeds[name];
  }

  state.ledsBlinking = false;

  resetLeds(done);
}

function createIoHandler(properties)
{
  var propertiesCount = properties.length;
  
  return function(err, dataBuffer)
  {
    if (err)
    {
      return;
    }
    
    var data = parseIoResponse(dataBuffer, propertiesCount),
        stateChanged = false,
        changedProperties = {},
        i = 0,
        property,
        newValue;
    
    if (data.length !== propertiesCount)
    {
      return;
    }
    
    for (; i < propertiesCount; ++i)
    {
      property = properties[i];
      newValue = data[i];
      
      if (state[property] !== newValue)
      {
        changedProperties[property] = newValue;
        state[property] = newValue;
        stateChanged = true;
      }
    }
    
    if (stateChanged)
    {
      onStateChange(changedProperties);
    }
  };
}

function parseIoResponse(dataBuffer, quantity)
{
  if (!dataBuffer)
  {
    return [];
  }
  
  var data = [],
      dataReader = new BufferReader(dataBuffer),
      byteValue,
      bitValue;
  
  dataReader.shiftByte();
  
  while (dataReader.length)
  {
    byteValue = dataReader.shiftByte();
    
    for (bitValue = 0; bitValue < 8; ++bitValue)
    {
      if (quantity && data.length === quantity)
      {
        break;
      }
      
      data.push(Boolean(byteValue & Math.pow(2, bitValue)));
    }
  }

  return data;
}
