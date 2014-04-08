// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

module.exports = function(app)
{
  app.message('pubsub.subscribe', function(res, client, message)
  {
    var topic = message.topic;
    
    client.broker.subscribe(topic, function(message)
    {
      client.json.send({type: topic, data: message});
    });
    
    res(true);
  });
  
  app.message('pubsub.unsubscribe', function(res, client, message)
  {
    var topic = message.topic;
    
    client.broker.unsubscribe(topic);
    
    res(true);
  });
};
