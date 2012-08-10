var inherits = require('util').inherits,
    Master = require('./Master'),
    Transaction = require('./Transaction'),
    functions = require('./functions');

var SerialMaster = module.exports = function(connection, transport, options)
{
  Master.call(this);
  
  this.setUpOptions(options || {});
  this.setUpConnection(connection);
  this.setUpTransport(transport);
  
  this.requestQueue = [];
  this.transactions = {};
};

inherits(SerialMaster, Master);

SerialMaster.prototype.isConnected = function()
{
  return this.connection.isConnected();
};

SerialMaster.prototype.connect = function()
{
  this.connection.connect();
};

SerialMaster.prototype.disconnect = function()
{
  this.connection.disconnect();
};

SerialMaster.prototype.executeRequest = function(options)
{
  var request = this.createRequest(options);
  
  if (this.isConnected())
  {
    this.transport.request(request.pdu, request.handler, request.timeout);
  }
  else
  {
    this.requestQueue.push(request);
  }
};

SerialMaster.prototype.addTransaction = function(options)
{
  var transaction = this.createTransaction(options);
  
  this.setUpTransaction(transaction);
  this.executeTransaction(transaction);
  
  this.emit('transaction.add', transaction);
};

SerialMaster.prototype.findTransactions = function(filter)
{
  var transactions = [];
  
  switch (typeof filter)
  {
    case 'undefined':
      for (var id in this.transactions)
      {
        transactions.push(this.transactions[id]);
      }
      break;
    
    case 'string':
      if (filter in this.transactions)
      {
        transactions.push(this.transactions[filter]);
      }
      break;
    
    case 'function':
      for (var id in this.transactions)
      {
        var transaction = this.transactions[id];
        
        if (filter(transaction))
        {
          transactions.push(transaction);
        }
      }
      break;
    
    case 'object':
      if (filter instanceof Array)
      {
        for (var i = 0, l = filter.length; i < l; ++i)
        {
          var transaction = this.transactions[filter[i]];
          
          if (transaction)
          {
            transactions.push(transaction);
          }
        }
      }
      break;
  }
  
  return transactions;
};

SerialMaster.prototype.removeTransactions = function(filter)
{
  var me = this;
  
  this.findTransactions(filter).forEach(function(transaction)
  {
    transaction.pause();
    
    delete me.transactions[transaction.id];
    
    me.emit('transaction.remove', transaction);
  });
};

SerialMaster.prototype.pauseTransactions = function(filter)
{
  this.findTransactions(filter).forEach(function(transaction)
  {
    transaction.pause();
  });
};

SerialMaster.prototype.resumeTransactions = function(filter)
{
  this.findTransactions(filter).forEach(function(transaction)
  {
    transaction.resume();
  });
};

/**
 * @private
 */
SerialMaster.prototype.setUpOptions = function(options)
{
  this.retry = typeof options.retry === 'number' && options.retry >= 0
    ? options.retry
    : 3;
  
  this.interval = typeof options.interval === 'number' && options.interval >= 0
    ? options.interval
    : 50;
};

/**
 * @private
 */
SerialMaster.prototype.setUpConnection = function(connection)
{
  var me = this;
  
  connection
    .on('connect', this.onConnect.bind(this))
    .on('error', function(err) { me.emit('error', err); })
    .on('disconnect', function(hadErr) { me.emit('disconnect', hadErr); });
  
  this.connection = connection;
};

/**
 * @private
 */
SerialMaster.prototype.setUpTransport = function(transport)
{
  this.transport = transport;
};

/**
 * @private
 */
SerialMaster.prototype.onConnect = function()
{
  this.emit('connect');
  
  this.executeQueuedRequests();
  this.executeRunningTransactions();
};

/**
 * @private
 */
SerialMaster.prototype.executeQueuedRequests = function()
{
  while (this.requestQueue.length)
  {
    var request = this.requestQueue.shift();
    
    this.transport.request(
      request.pdu,
      request.handler,
      request.timeout
    );
  }
};

/**
 * @private
 */
SerialMaster.prototype.executeRunningTransactions = function()
{
  for (var id in this.transactions)
  {
    this.executeTransaction(this.transactions[id]);
  }
};

/**
 * @private
 */
SerialMaster.prototype.createRequest = function(options)
{
  var request = {
    pdu: this.createRequestPdu(options),
    timeout: options.timeout > 0 ? options.timeout : undefined,
    retry: options.retry >= 0 ? options.retry : this.retry,
    retries: 0
  };
  
  request.handler = this.createRequestHandler(request, options.handler);
  
  return request;
};

/**
 * @private
 */
SerialMaster.prototype.createRequestPdu = function(options)
{
  if (options instanceof Buffer)
  {
    return options;
  }
  
  if (options.pdu instanceof Buffer)
  {
    return options.pdu;
  }
  
  if (options.fn in functions)
  {
    return functions[options.fn](options);
  }
  
  throw new Error('Cannot execute request: no PDU specified.');
};

/**
 * @private
 */
SerialMaster.prototype.createRequestHandler = function(request, userHandler)
{
  var me = this;
  
  return function(err, data)
  {
    if (err && ++request.retries <= request.retry)
    {
      setTimeout(function()
      {
        me.transport.request(
          request.pdu,
          request.handler,
          request.timeout
        );
      }, me.interval);
    }
    else if (typeof userHandler === 'function')
    {
      userHandler(err, data);
    }
  };
};

/**
 * @private
 */
SerialMaster.prototype.createTransaction = function(options)
{
  return options instanceof Transaction ? options : new Transaction(options);
};

/**
 * @private
 */
SerialMaster.prototype.setUpTransaction = function(transaction)
{
  var me = this;
  
  transaction
    .on('pause', function onPause() { me.emit('transaction.pause', this); })
    .on('resume', function onResume()
    {
      me.emit('transaction.resume', this);
      me.executeTransaction(this);
    });
  
  this.once('transaction.remove', function(removedTransaction)
  {
    if (removedTransaction === transaction)
    {
      return;
    }
    
    transaction.removeListener('pause', onPause);
    transaction.removeListener('resume', onResume);
  });
  
  this.transactions[transaction.id] = transaction;
};

SerialMaster.prototype.executeTransaction = function(transaction)
{
  if (!this.isConnected() || transaction.isPaused())
  {
    return;
  }
  
  var master = this;
  
  this.transport.request(
    transaction.pdu,
    function(err, data)
    {
      transaction.handler(err, data);
      
      setTimeout(
        function()
        {
          master.executeTransaction(transaction);
        },
        transaction.interval || master.interval
      );
    },
    transaction.timeout
  );
};
  
