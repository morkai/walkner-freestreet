Tests = Backbone.Collection.extend({
  model: Test,
  initialize: function(_, options)
  {
    var me = this,
        broker = options.broker;

    me.loaded = false;
    me.clearTimer = null;
    
    broker.subscribe('tests.created', function(test)
    {
      me.add(test);
    });
  },
  reload: function(force, cb)
  {
    var me = this;

    cb || (cb = function() {});
    
    if (me.loaded)
    {
      clearTimeout(me.clearTimer);

      me.clearTimer = null;

      if (!force)
      {
        return cb(false);
      }
    }

    $.ajax({
      type: 'GET',
      url: '/tests',
      contentType: 'application/json',
      success: function(data)
      {
        me.loaded = true;

        if (app.tests)
        {
          me.refresh(data);
        }
        
        if (cb)
        {
          cb(false);
        }
      },
      error: function()
      {
        if (cb)
        {
          cb(true);
        }
      }
    });
  },
  setClearTimer: function()
  {
    var me = this;
    
    if (me.clearTimer)
    {
      clearTimeout(me.clearTimer);
      
      me.clearTimer = null;
    }

    me.clearTimer = setTimeout(function()
    {
      me.refresh([]);
      me.loaded = false;
    }, 30000);
  }
});
