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
