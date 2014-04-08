// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

TestsController = Backbone.Controller.extend({
  initialize: function(app)
  {
    this.app = app;
  },
  routes: {
    'tests': 'list',
    'tests/:id': 'view'
  },
  list: function()
  {
    var app = this.app;
    
    if (!app.tests.loaded)
    {
      app.overlay.show();
    }
    
    app.tests.reload(false, function()
    {
      app.overlay.hide();
      
      app.bd.setView(new TestsListView({app: app}));
    });
  },
  view: function(id)
  {
    var app = this.app;
    
    if (!app.tests.loaded)
    {
      app.overlay.show();
    }
    
    app.tests.reload(false, function()
    {
      app.overlay.hide();
      
      var model = app.tests.get(id);
      
      app.bd.setView(
        model
          ? new TestDetailsView({app: app, model: model})
          : new NotFoundView({app: app})
      );
    });
  }
});
