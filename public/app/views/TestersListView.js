// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

TestersListView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.testers   = app.testers;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('testersList');
    me.touchList = app.util.touchList;
    
    _.bindAll(me, 'renderList');
    
    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.testers.bind(eventName, me.renderList);
    });
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('Testery')
      .setActions({
        back: '#home',
        addTester: {
          text: 'Dodaj',
          privilage: 'testers.add',
          handler: '#testers/add',
          right: 1
        }
      });
    
    me.renderList();
  },
  renderList: function()
  {
    var me = this;
    
    me.bd.setHtml(me.template({
      testers: me.testers.map(function(tester)
      {
        var status = '';
        
        if (tester.get('redLed'))
          status = 'error';
        else if (tester.get('orangeLed'))
          status = 'warning';
        else if (tester.get('greenLed'))
          status = 'ok';
        
        return {
          id: tester.get('id'),
          status: status,
          name: tester.escape('name')
        };
      })
    }));
    
    me.touchList(me.$('#testersList'));
  },
  destroy: function()
  {
    var me = this;
    
    ['add', 'remove', 'change'].forEach(function(eventName)
    {
      me.testers.unbind(eventName, me.renderList);
    });
  }
});
