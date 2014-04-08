// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

ProgramsController = Backbone.Controller.extend({
  initialize: function(app)
  {
    this.app = app;
  },
  routes: {
    'programs': 'list',
    'programs/add': 'add',
    'programs/:id': 'view',
    'programs/:id/edit': 'edit'
  },
  list: function()
  {
    this.app.bd.setView(new ProgramsListView({app: this.app}));
  },
  add: function()
  {
    this.app.bd.setView(new AddProgramView({app: this.app}));
  },
  view: function(id)
  {
    var me = this,
        model = me.app.programs.get(id);
    
    me.app.bd.setView(
      model
        ? new ProgramDetailsView({app: this.app, model: model})
        : new NotFoundView({app: this.app})
    );
  },
  edit: function(id)
  {
    var me = this,
        model = me.app.programs.get(id);
    
    me.app.bd.setView(
      model
        ? new EditProgramView({app: this.app, model: model})
        : new NotFoundView({app: this.app})
    );
  }
});
