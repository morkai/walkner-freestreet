// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

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
