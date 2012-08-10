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
