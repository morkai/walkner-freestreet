// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

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
