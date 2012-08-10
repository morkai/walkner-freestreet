(function()
{
  function indentText(text, indent)
  {
    return new Array((indent * 4) + 1).join(' ') + text;
  }
  
  var ops = {};
  
  ops.repeat = {
    toCode: function(op, indent)
    {
      var code = indentText('REPEAT ', indent);
      
      if (typeof op.time === 'number')
      {
        code += 'time=' + op.time;
      }
      else if (typeof op.count === 'number')
      {
        code += 'count=' + op.count;
      }
      else
      {
        code += 'count=1';
      }
      
      _.each(op.operations || [], function(operation)
      {
        if (operation.type in ops)
        {
          code += '\n' + ops[operation.type].toCode(operation, indent + 1);
        }
      });
      
      return code;
    },
    toText: function(op, indent)
    {
      var text = indentText('Powtarzaj ', indent);
      
      if (typeof op.time === 'number')
      {
        text += 'przez ' + op.time + ' sekund';
      }
      else if (typeof op.count === 'number')
      {
        text += op.count + ' razy';
      }
      
      text += ':';
      
      _.each(op.operations || [], function(operation)
      {
        if (operation.type in ops)
        {
          text += '\n' + ops[operation.type].toText(operation, indent + 1);
        }
      });
      
      return text;
    }
  };
  
  ops.wait = {
    toCode: function(op, indent)
    {
      return indentText('WAIT time=' + (op.time || 1), indent);
    },
    toText: function(op, indent)
    {
      return indentText('Czekaj ' + (op.time || 1) + ' sekund', indent);
    }
  };
  
  ops.beep = {
    toCode: function(op, indent)
    {
      return indentText('BEEP time=' + (op.time || 1), indent);
    },
    toText: function(op, indent)
    {
      return indentText('Brzęcz przez ' + (op.time || 1) + ' sekund', indent);
    }
  };
  
  ops.shutdown = {
    toCode: function(op, indent)
    {
      return indentText('SHUTDOWN time=' + (op.time || 1), indent);
    },
    toText: function(op, indent)
    {
      return indentText('Wyłącz na ' + (op.time || 1) + ' sekund', indent);
    }
  };
  
  ops.pwm = {
    toCode: function(op, indent)
    {
      return indentText('PWM value=' + (op.value || 0) + ', time=' + (op.time || 0), indent);
    },
    toText: function(op, indent)
    {
      return indentText('Zmień natężenie na ' + (op.value || 0) + '% przez ' + (op.time || 0) + ' sekund', indent);
    }
  };
  
  function to(format, operations)
  {
    return function(operations)
    {
      var result = '';
      
      _.each(operations, function(operation)
      {
        if (!(operation.type in ops))
        {
          throw new Error('Nieznany typ operacji [' + operation.type + '].');
        }
        
        result += '\n' + ops[operation.type]['to' + format](operation, 0);
      });
      
      return result.substring(1);
    };
  }
  
  window.operations = {
    toText: to('Text'),
    toCode: to('Code')
  };
})(window);
