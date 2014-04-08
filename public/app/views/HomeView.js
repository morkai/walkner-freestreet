// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

HomeView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.user      = app.user;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('home');
    me.touchList = app.util.touchList;
  },
  render: function()
  {
    var me = this;
    
    me.hd.setTitle('Tester opraw LED').setActions({
      login: {
        text: me.user.authenticated ? 'Wyloguj się' : 'Zaloguj się',
        handler: '#login',
        right: 1
      }
    });
    
    me.bd.setHtml(me.template({
      userRole: me.user.role
    }));
    
    me.touchList(me.$('#menuList'));
  }
});
