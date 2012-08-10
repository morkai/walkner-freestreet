NotFoundView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.hd = app.hd;
    me.bd = app.bd;
    
    me.template = app.template('404');
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('404')
      .setActions({
        goBack: {
          text: 'Wróć',
          handler: function() { window.history.back(); }
        }
      });
    
    me.bd.setHtml(me.template());
  }
});