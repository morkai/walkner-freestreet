// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

ProgramsListView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.programs  = app.programs;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('programsList');
    me.touchList = app.util.touchList;
    
    _.bindAll(me, 'renderList');
    
    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.programs.bind(eventName, me.renderList);
    });
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('Programy')
      .setActions({
        back: '#home',
        addTester: {
          text: 'Dodaj',
          handler: '#programs/add',
          right: 1
        }
      });
    
    me.renderList();
  },
  renderList: function()
  {
    var me = this;
    
    me.bd.setHtml(me.template({
      programs: me.programs.toJSON()
    }));
    
    me.touchList(me.$('#programsList'));
  },
  destroy: function()
  {
    var me = this;
    
    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.programs.unbind(eventName, me.renderList);
    });
  }
});
