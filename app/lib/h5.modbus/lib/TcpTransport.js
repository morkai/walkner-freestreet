var inherits = require('util').inherits,
    BufferReader = require('../../h5.buffers/lib').BufferReader,
    BufferQueueReader = require('../../h5.buffers/lib').BufferQueueReader,
    BufferBuilder = require('../../h5.buffers/lib').BufferBuilder,
    Transport = require('./Transport'),
    exceptions = require('./exceptions');

/**
 * @param {h5.modbus.Connection} connection
 * @param {?Object} options
 */
var TcpTransport = module.exports = function(connection, options)
{
  Transport.call(this);
  
  this.reader = new BufferQueueReader();
  this.header = null;
  this.requests = {};
  this.nextId = 0;
  
  this.setUpOptions(options || {});
  this.setUpConnection(connection);
};

inherits(TcpTransport, Transport);

TcpTransport.prototype.timeout;

TcpTransport.prototype.maxTimeouts;

TcpTransport.prototype.request = function(pdu, handler, timeout)
{
  if (++this.nextId > 0xFFFF)
  {
    this.nextId = 0;
  }
  
  this.requests[this.nextId] = {
    handler: handler,
    timeout: this.createTimeoutHandler(timeout)
  };
  
  this.connection.write(this.buildAdu(pdu));
};

TcpTransport.prototype.setUpOptions = function(options)
{
  this.timeout = 500;
  this.maxTimeouts = 10;
  
  if (typeof options.timeout === 'number' && options.timeout > 0)
  {
    this.timeout = options.timeout;
  }
  
  if (typeof options.maxTimeouts === 'number' && options.maxTimeouts > 0)
  {
    this.maxTimeouts = options.maxTimeouts;
  }
  
  for (var event in (options.listeners || {}))
  {
    this.on(event, options.listeners[event]);
  }
};

TcpTransport.prototype.setUpConnection = function(connection)
{
  connection.on('data', this.onData.bind(this));
  
  this.connection = connection;
};

TcpTransport.prototype.createTimeoutHandler = function(timeout)
{
  var me = this,
      id = this.nextId;
  
  return setTimeout(
    function()
    {
      if (!(id in me.requests))
      {
        return;
      }
      
      var request = me.requests[id];
      
      delete me.requests[id];
      
      request.handler(new Error('Timed out.'), null);
      
      me.timeouts += 1;
      
      if (me.timeouts === me.maxTimeouts)
      {
        me.connection.disconnect(true);
      }
    },
    timeout || this.timeout
  );
};

TcpTransport.prototype.buildAdu = function(pdu)
{
  return new BufferBuilder()
    .pushUnsignedInt(this.nextId, 2)
    .pushUnsignedInt(0, 2)
    .pushUnsignedInt(pdu.length, 2)
    .pushBuffer(pdu)
    .toBuffer();
};

TcpTransport.prototype.onData = function(data)
{
  if (data)
  {
    this.reader.pushBuffer(data);
  }
  
  if (!this.header && this.reader.length >= 7)
  {
    this.readFrameHeader();
  }
  
  if (this.header && this.reader.length >= this.header.length - 1)
  {
    this.handleFrameData();
  }
};

TcpTransport.prototype.readFrameHeader = function()
{
  this.header = {
    id: this.reader.shiftUnsignedInt(2),
    version: this.reader.shiftUnsignedInt(2),
    length: this.reader.shiftUnsignedInt(2),
    unit: this.reader.shiftByte(1)
  };
};

TcpTransport.prototype.handleFrameData = function()
{
  var header = this.header,
      request = this.requests[header.id];
  
  this.header = null;
  
  if (!request)
  {
    this.reader.skip(header.length - 1);
    
    return;
  }
  
  clearTimeout(request.timeout);
  
  delete this.requests[header.id];
  
  var response = new BufferReader(this.reader.shiftBuffer(header.length - 1)),
      fn = response.shiftByte(),
      error = null,
      errno = 0,
      data = null;
  
  if (fn > 0x80)
  {
    errno = response.shiftByte();
    error = errno in exceptions
      ? exceptions[errno]()
      : new Error('Unknown error [' + errno + '].');
  }
  else
  {
    data = response.readBuffer(response.length);
  }
  
  this.handleResponse(request.handler, error, data);
  this.onData();
};

TcpTransport.prototype.handleResponse = function(handler, error, data)
{
  this.timeouts = 0;
  
  if (typeof handler !== 'function')
  {
    return;
  }
  
  try
  {
    handler(error, data);
  }
  catch (err)
  {
    this.emit('error', err);
  }
};
