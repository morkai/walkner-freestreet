// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var MessageBroker = require('../lib/h5.pubsub/lib').MessageBroker;

module.exports = function(app, next)
{
  app.broker = new MessageBroker();
  
  console.log('Broker module initialized.');
  
  next();
};
