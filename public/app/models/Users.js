// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

Users = Backbone.Collection.extend({
  model: User,
  initialize: function(_, options)
  {
    var me = this,
        broker = options.broker;
    
    broker.subscribe('users.created', function(user)
    {
      me.add(user);
    });
    
    broker.subscribe('users.destroyed', function(id)
    {
      var user = me.get(id);
      
      if (user)
      {
        me.remove(user);
      }
    });
    
    broker.subscribe('users.updated', function(message)
    {
      var user = me.get(message.id);
      
      if (user)
      {
        user.set(message.changes);
      }
    });
  },
  getRoles: function()
  {
    return {
      'user':       'Użytkownik',
      'programmer': 'Programista',
      'admin':      'Administrator'
    }
  }
});
