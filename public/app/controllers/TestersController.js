// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

TestersController = Backbone.Controller.extend({
  initialize: function(app)
  {
    this.app = app;
  },
  routes: {
    'testers': 'list',
    'testers/add': 'add',
    'testers/:id': 'view',
    'testers/:id/edit': 'edit',
    'testers/:id/program': 'program'
  },
  list: function()
  {
    this.app.bd.setView(new TestersListView({app: this.app}));
  },
  add: function()
  {
    this.app.bd.setView(new AddTesterView({app: this.app}));
  },
  view: function(id)
  {
    var me = this,
        model = me.app.testers.get(id);
    
    me.app.bd.setView(
      model
        ? new TesterDetailsView({app: me.app, model: model})
        : new NotFoundView({app: me.app})
    );
  },
  edit: function(id)
  {
    var me = this,
        model = me.app.testers.get(id);
    
    me.app.bd.setView(
      model
        ? new EditTesterView({app: me.app, model: model})
        : new NotFoundView({app: me.app})
    );
  },
  program: function(id)
  {
    var me = this,
        model = me.app.testers.get(id);
    
    me.app.bd.setView(
      model
        ? new ProgramTesterView({app: me.app, model: model})
        : new NotFoundView({app: me.app})
    );
  }
});
