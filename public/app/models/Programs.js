Programs = Backbone.Collection.extend({
  model: Program,
  initialize: function(_, options)
  {
    var me = this,
        broker = options.broker;
    
    broker.subscribe('programs.created', function(program)
    {
      me.add(program);
    });
    
    broker.subscribe('programs.destroyed', function(id)
    {
      var program = me.get(id);
      
      if (program)
      {
        me.remove(program);
      }
    });
    
    broker.subscribe('programs.updated', function(message)
    {
      var program = me.get(message.id);
      
      if (program)
      {
        program.set(message.changes);
      }
    });
  },
  getNamesMap: function()
  {
    var names = {'': 'Niezaprogramowane'};
    
    this.models.forEach(function(program)
    {
      names[program.get('id')] = program.get('name');
    });
    
    return names;
  }
});