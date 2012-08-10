Testers = Backbone.Collection.extend({
  model: Tester,
  initialize: function(_, options)
  {
    var me = this,
        broker = options.broker;
    
    broker.subscribe('testers.created', function(tester)
    {
      me.add(tester);
    });
    
    broker.subscribe('testers.destroyed', function(id)
    {
      var tester = me.get(id);
      
      if (tester)
      {
        me.remove(tester);
      }
    });
    
    broker.subscribe('testers.updated', function(message)
    {
      var tester = me.get(message.id);
      
      if (tester)
      {
        tester.set(message.changes);
      }
    });
  }
});