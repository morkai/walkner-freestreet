var ops = {};
var nextOffset = 0;

function getInterval(base)
{
  var interval = base - nextOffset;
  
  if (interval < 0)
  {
    nextOffset = nextOffset - base;
    interval   = 0;
  }
  else
  {
    nextOffset = 0;
  }
  
  return interval;
}

function parse(op, context)
{
  if (op instanceof Array)
  {
    return op.map(function(op) { return parse(op, context); });
  }
  
  if (op.type in ops)
  {
    return ops[op.type].call(context, op);
  }
  
  throw new Error('Unknown operation [' + op.type + '].');
}

function compile(src)
{
  var operations      = parse(src, {loops: 0}),
      operationsCount = operations.length;
  
  return {
    totalTime: countTime(operations),
    execute: function(master, context, done)
    {
      var operationIndex = 0;
      
      nextOperation();
      
      function nextOperation()
      {
        if (!context.running)
        {
          return;
        }
        
        if (context.paused)
        {
          return context.resume = nextOperation;
        }
        
        if (operationIndex < operationsCount)
        {
          process.nextTick(function()
          {
            operations[operationIndex++].execute(master, context, nextOperation);
          });
        }
        else
        {
          process.nextTick(done);
        }
      }
    }
  };
}

function countTime(op)
{
  if (op instanceof Array)
  {
    return op.reduce(function(totalTime, currentOp) { return totalTime + (currentOp.totalTime || 0); }, 0);
  }
  
  return op.totalTime || 0;
}

ops.repeat = function(options)
{
  var repeatCount     = 1,
      operations      = parse(options.operations || [], this),
      operationsCount = operations.length,
      iterationTime   = countTime(operations),
      iterationTimeMs = iterationTime * 1000,
      loop            = this.loops++;
  
  if (typeof options.time === 'number')
  {
    repeatCount = iterationTime < 1 ? 1 : Math.round(options.time / iterationTime);
  }
  
  if (typeof options.count === 'number')
  {
    repeatCount = options.count;
  }
  
  return {
    totalTime: iterationTime * repeatCount,
    execute: function(master, context, done)
    {
      var repeatIndex    = 0,
          operationIndex = 0,
          flatTime       = context.flatTime,
          pwmValue       = context.pwmValue;
      
      if (!(loop in context.loops))
      {
        context.loops[loop]  = 0;
        context.loopsChanged = true;
      }
      
      repeatOperations();
      
      function repeatOperations()
      {
        if (!context.running)
        {
          return;
        }
        
        if (context.paused)
        {
          return context.resume = repeatOperations;
        }
        
        if (repeatIndex++ < repeatCount)
        {
          context.flatTime     = flatTime;
          context.pwmValue     = pwmValue;
          context.loops[loop] += 1;
          context.loopsChanged = true;
          
          return process.nextTick(nextOperation);
        }
        
        repeatIndex = 0;
        
        process.nextTick(done);
      }
      
      function nextOperation()
      {
        if (!context.running)
        {
          return;
        }
        
        if (context.paused)
        {
          return context.resume = nextOperation;
        }
        
        if (operationIndex < operationsCount)
        {
          return process.nextTick(function()
          {
            operations[operationIndex++].execute(master, context, nextOperation);
          });
        }
        
        operationIndex = 0;
        
        process.nextTick(repeatOperations);
      }
    }
  };
};

ops.wait = function(options)
{
  var totalTime = options.time || 1;
  
  if (totalTime < 0.1)
  {
    totalTime = 0.1;
  }
  
  var totalTimeMs = totalTime * 1000;
  
  return {
    totalTime: totalTime,
    execute: function(master, context, done)
    {
      var flatTime  = context.flatTime,
          totalTime = context.totalTime;
      
      if (!context.running) return;
      
      if (context.paused)
      {
        context.resume = wait;
      }
      else
      {
        wait();
      }
      
      function wait()
      {
        var interval = setInterval(
          function()
          {
            context.flatTime  += 100;
            context.totalTime += 100;
          },
          100
        );
        
        setTimeout(
          function()
          {
            clearInterval(interval);
            
            context.flatTime  = flatTime + totalTimeMs;
            context.totalTime = totalTime + totalTimeMs;
            
            process.nextTick(done);
          },
          totalTimeMs - 2
        );
      }
    }
  };
};

ops.beep = function(options)
{
  var totalTime = options.time || 1;
  
  if (totalTime < 0.1)
  {
    totalTime = 0.1;
  }
  
  var totalTimeMs = totalTime * 1000;
  
  return {
    totalTime: totalTime,
    execute: function(master, context, done)
    {
      var startTime = Date.now(),
          flatTime  = context.flatTime,
          totalTime = context.totalTime;
      
      if (!context.running) return;
      
      if (context.paused)
      {
        context.resume = setBeeperOn;
      }
      else
      {
        setBeeperOn();
      }
      
      function setBeeperOff()
      {
        var interval = setInterval(function()
        {
          context.flatTime  += 100;
          context.totalTime += 100;
        }, 100);
        
        setTimeout(
          function()
          {
            clearInterval(interval);
            
            if (!context.running) return;
            
            master.executeRequest({
              fn: 5,
              address: context.BEEPER_ADDRESS,
              value: 0,
              handler: function(err)
              {
                if (err)
                {
                  throw new Error('Nie udało się wyłączyć brzęczyka.');
                }
              }
            });
            
            context.flatTime  = flatTime + totalTimeMs;
            context.totalTime = totalTime + totalTimeMs;
            
            process.nextTick(done);
          },
          getInterval(totalTimeMs - 2)
        );
      }
      
      function setBeeperOn()
      {
        master.executeRequest({
          fn: 5,
          address: context.BEEPER_ADDRESS,
          value: 1,
          handler: function(err)
          {
            if (!context.running) return;
            
            if (err)
            {
              throw new Error('Nie udało się włączyć brzęczyka.');
            }
            
            if (context.paused)
            {
              context.resume = setBeeperOff;
            }
            else
            {
              nextOffset += Date.now() - startTime;
              
              return process.nextTick(setBeeperOff);
            }
          }
        });
      }
    }
  };
};

ops.shutdown = function(options)
{
  var totalTime = options.time || 1;

  if (totalTime < 0.1)
  {
    totalTime = 0.1;
  }

  var totalTimeMs = totalTime * 1000;

  return {
    totalTime: totalTime,
    execute: function(master, context, done)
    {
      var flatTime = context.flatTime;
      var totalTime = context.totalTime;

      if (!context.running) return;

      if (context.paused)
      {
        context.resume = shutdown;
      }
      else
      {
        shutdown();
      }

      function shutdown()
      {
        var interval = setInterval(
          function()
          {
            context.flatTime  += 100;
            context.totalTime += 100;
          },
          100
        );

        setTimeout(
          function()
          {
            clearInterval(interval);

            context.flatTime  = flatTime + totalTimeMs;
            context.totalTime = totalTime + totalTimeMs;

            master.executeRequest({
              fn: 6,
              address: context.PWM_ADDRESS,
              value: Math.round(context.pwmValue),
              handler: function(err)
              {
                if (err)
                {
                  throw new Error('Could not turn on the lamp.');
                }

                process.nextTick(done);
              }
            });
          },
          totalTimeMs - 2
        );

        master.executeRequest({
          fn: 6,
          address: context.PWM_ADDRESS,
          value: context.PWM_OFF_VALUE,
          handler: function(err)
          {
            if (err)
            {
              throw new Error('Could not turn off the lamp.');
            }
          }
        });
      }
    }
  };
};

ops.pwm = function(options)
{
  var newValue    = options.value || 0,
      totalTime   = options.time || 0,
      totalTimeMs = totalTime * 1000,
      interval    = options.interval || 100,
      stepsCount  = Math.ceil(totalTime * 1000 / interval);
  
  return {
    totalTime: totalTime,
    execute: function(master, context, done)
    {
      var startTime = Date.now(),
          flatTime  = context.flatTime,
          totalTime = context.totalTime;
      
      if (!context.running) return;
      
      var oldValue  = 100 * context.pwmValue / context.PWM_MAX_VALUE,
          step      = Math.abs(oldValue - newValue) / stepsCount,
          stepIndex = 0,
          increment = newValue > oldValue,
          value     = oldValue,
          stepStartTime;
      
      if (oldValue === newValue)
      {
        if (context.paused)
        {
          return context.resume = doneCozOfSameValues;
        }
        
        return process.nextTick(doneCozOfSameValues);
      }
      
      if (stepsCount === 0)
      {
        if (context.paused)
        {
          return context.resume = doneImmediately;
        }
        
        return process.nextTick(doneImmediately);
      }
      
      return process.nextTick(nextStep);
      
      function doneCozOfSameValues()
      {
        var interval = setInterval(
          function()
          {
            context.flatTime  += 100;
            context.totalTime += 100;
          },
          100
        );

        setTimeout(
          function()
          {
            clearInterval(interval);
            
            context.flatTime  = flatTime + totalTimeMs;
            context.totalTime = totalTime + totalTimeMs;
            
            process.nextTick(done);
          },
          getInterval(totalTimeMs - 2)
        );
      }
      
      function doneImmediately()
      {
        context.pwmValue = Math.round((newValue / 100) * context.PWM_MAX_VALUE);
        
        return master.executeRequest({
          fn: 6,
          address: context.PWM_ADDRESS,
          value: context.pwmValue,
          handler: function(err)
          {
            if (err)
            {
              throw new Error('Nie udało się ustawić natychmiastowo natężenia.');
            }
            
            process.nextTick(done);
          }
        });
      }
      
      function nextStep(err)
      {
        if (!context.running) return;
        
        if (err)
        {
          throw new Error('Nie udało się ustawić natężenia krokowo.');
        }
        
        if (context.paused)
        {
          return context.resume = nextStep;
        }
        
        if (++stepIndex > stepsCount)
        {
          var opTime = Date.now() - startTime;
          
          if (opTime > totalTimeMs)
          {
            nextOffset += opTime - totalTimeMs - 1;
          }
          
          context.flatTime  = flatTime + totalTimeMs;
          context.totalTime = totalTime + totalTimeMs;
          
          return process.nextTick(done);
        }
        
        if (increment)
        {
          value += step;
        }
        else
        {
          value -= step;
        }
        
        if (stepStartTime)
        {
          nextOffset += Date.now() - stepStartTime;
        }
        
        context.flatTime  += interval;
        context.totalTime += interval;
        
        setTimeout(function()
        {
          stepStartTime = Date.now();
          
          if (!context.running) return;
          
          context.pwmValue = Number(((value / 100) * context.PWM_MAX_VALUE).toFixed(4));
          
          master.executeRequest({
            fn: 6,
            address: context.PWM_ADDRESS,
            value: Math.round(context.pwmValue),
            handler: nextStep
          });
        }, getInterval(interval));
      }
    }
  };
};

module.exports = {
  compile: compile
};
