// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

UsersListView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.users     = app.users;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('usersList');
    me.touchList = app.util.touchList;
    
    _.bindAll(me, 'renderList');
    
    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.users.bind(eventName, me.renderList);
    });
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('Użytkownicy')
      .setActions({
        back: '#home',
        addTester: {
          text: 'Dodaj',
          handler: '#users/add',
          right: 1
        }
      });
    
    me.renderList();
  },
  renderList: function()
  {
    var me = this;
    
    me.bd.setHtml(me.template({
      users: me.users.toJSON()
    }));
    
    me.touchList(me.$('#usersList'));
  },
  destroy: function()
  {
    var me = this;
    
    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.users.unbind(eventName, me.renderList);
    });
  }
});
