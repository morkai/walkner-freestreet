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