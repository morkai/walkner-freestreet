UsersController = Backbone.Controller.extend({
  initialize: function(app)
  {
    this.app = app;
  },
  routes: {
    'users': 'list',
    'users/add': 'add',
    'users/:id': 'view',
    'users/:id/edit': 'edit'
  },
  list: function()
  {
    this.app.bd.setView(new UsersListView({app: this.app}));
  },
  add: function()
  {
    this.app.bd.setView(new AddUserView({app: this.app}));
  },
  view: function(id)
  {
    var me = this,
        model = me.app.users.get(id);
    
    me.app.bd.setView(
      model
        ? new UserDetailsView({app: this.app, model: model})
        : new NotFoundView({app: this.app})
    );
  },
  edit: function(id)
  {
    var me = this,
        model = me.app.users.get(id);
    
    me.app.bd.setView(
      model
        ? new EditUserView({app: this.app, model: model})
        : new NotFoundView({app: this.app})
    );
  }
});