var MessageBroker = require('../lib/h5.pubsub/lib').MessageBroker;

module.exports = function(app, next)
{
  app.broker = new MessageBroker();
  
  console.log('Broker module initialized.');
  
  next();
};
