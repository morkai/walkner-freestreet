TestsListView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.tests     = app.tests;
    me.overlay   = app.overlay;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('testsList');
    me.touchList = app.util.touchList;
    
    _.bindAll(me, 'renderList', 'onPurgeClick');

    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.tests.bind(eventName, me.renderList);
    });
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('Testy')
      .setActions({
        back: '#home',
        purgeTests: {
          text: 'Wyczyść',
          privilage: 'tests.purge',
          handler: me.onPurgeClick,
          right: 1
        }
      });
    
    me.renderList();
  },
  renderList: function()
  {
    var me = this;
    
    me.bd.setHtml(me.template({
      tests: me.tests.toJSON().map(function(test)
      {
        test.startTime = new Date(test.startTime);
        test.endTime = new Date(test.endTime);
        
        return test;
      })
    }));
    
    me.touchList(me.$('#testsList'));
  },
  destroy: function()
  {
    var me = this;
    
    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.tests.unbind(eventName, me.renderList);
    });

    me.tests.setClearTimer();
  },
  onPurgeClick: function()
  {
    var me = this;

    me.overlay.show();

    var days = parseFloat(prompt('Usuń logi testów starszych niż następująca liczba dni:'));

    if (isNaN(days))
    {
      return me.overlay.hide();
    }

    $.ajax({
      type: 'POST',
      url: '/tests/purge',
      data: {days: days},
      success: function()
      {
        me.tests.reload(true);
      },
      error: function()
      {
        alert('Nie udało się usunąć starych logów.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
  }
});
