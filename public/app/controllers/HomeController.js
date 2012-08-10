HomeController = Backbone.Controller.extend({
  initialize: function(app)
  {
    this.app = app;
  },
  routes: {
    'home': 'home',
    'login': 'login'
  },
  home: function()
  {
    this.app.bd.setView(new HomeView({
      app: this.app
    }));
  },
  login: function()
  {
    var app = this.app;
    
    if (app.user.authenticated)
    {
      $.ajax({
        type: 'POST',
        url: '/logout',
        complete: function()
        {
          app.user.logout();
          
          location.hash = 'home';
        }
      })
    }
    else
    {
      app.bd.setView(new LoginView({app: app}));
    }
  }
});