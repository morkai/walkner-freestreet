var BufferBuilder = require('../../h5.buffers/lib').BufferBuilder;

function exportRequest(fn, name, builder)
{
  exports[fn] = exports[name] = builder;
}

function createBuilder()
{
  var builder = new BufferBuilder(),
      bytes = 0,
      value = 1;
  
  for (; bytes < arguments.length; bytes += 2, value += 2)
  {
    builder.pushUnsignedInt(arguments[value], arguments[bytes]);
  }
  
  return builder;
}

function createBuffer()
{
  return createBuilder.apply(null, arguments).toBuffer();
}

function createReadRequest(fn)
{
  return function(options)
  {
    options = options || {};
    
    return createBuffer(
      1, options.unit || 0,
      1, fn,
      2, options.address || 0,
      2, options.quantity || 1
    );
  };
}

function applyRegisterValues(builder, values)
{
  if (values instanceof Buffer)
  {
    builder
      .pushUnsignedInt(values.length / 2, 2)
      .pushByte(values.length)
      .pushBuffer(values);
  }
  else if (typeof options.values === 'function')
  {
    values(builder);
  }
  else
  {
    builder
      .pushUnsignedInt(values.length, 2)
      .pushByte(values.length * 2);
    
    values.forEach(function(value)
    {
      builder.pushUnsignedInt(value, 2);
    });
  }
}

exportRequest(1, 'readCoils', createReadRequest(1));
exportRequest(2, 'readDiscreteInputs', createReadRequest(2));
exportRequest(3, 'readHoldingRegisters', createReadRequest(3));
exportRequest(4, 'readInputRegisters', createReadRequest(4));
exportRequest(5, 'writeSingleCoil', function(options)
{
  options = options || {};
  
  return createBuffer(
    1, options.unit || 0,
    1, 5,
    2, options.address || 0,
    2, options.value ? 0xFF00 : 0x0000
  );
});
exportRequest(6, 'writeSingleRegister', function(options)
{
  options = options || {};
  
  return createBuffer(
    1, options.unit || 0,
    1, 6,
    2, options.address || 0,
    2, options.value || 0
  );
});
exportRequest(15, 'writeMultipleCoils', function(options)
{
  options = options || {};
  options.values = options.values || [];
  
  var quantity = options.values.length,
      byteCount = Math.floor(quantity / 8) + (quantity % 8 !== 0 ? 1 : 0),
      byteValue = 0,
      builder = createBuilder(
        1, options.unit || 0,
        1, 15,
        2, options.address || 0,
        2, quantity,
        1, byteCount
      );
  
  options.values.forEach(function(state, i)
  {
    var r = i % 8;
    
    if (i !== 0 && r === 0)
    {
      builder.pushByte(byteValue);
      
      byteValue = 0;
    }
    
    if (state)
    {
      byteValue |= Math.pow(2, r);
    }
  });
  
  return builder.pushByte(byteValue).toBuffer();
});
exportRequest(16, 'writeMultipleRegisters', function(options)
{
  options = options || {};
  
  var builder = createBuilder(
    1, options.unit || 0,
    1, 16,
    2, options.address || 0
  );
  
  applyRegisterValues(builder, options.values || []);
  
  return builder.toBuffer();
});
exportRequest(22, 'maskWriteRegister', function(options)
{
  options = options || {};
  
  return createBuffer(
    1, options.unit || 0,
    1, 22,
    2, options.address || 0,
    2, options.andMask || 0,
    2, options.orMask || 0
  );
});
exportRequest(23, 'readWriteMultipleRegisters', function(options)
{
  options = options || {};
  
  var builder = createBuilder(
    1, options.unit || 0,
    1, 23,
    2, options.readAddress || 0,
    2, options.readQuantity || 1,
    2, options.writeAddress || 0
  );
  
  applyRegisterValues(builder, options.values || []);
  
  return builder.toBuffer();
});
exportRequest(24, 'readFifoQueue', function(options)
{
  options = options || {};
  
   return createBuffer(
    1, options.unit || 0,
    1, 24,
    2, options.address || 0
  );
});
