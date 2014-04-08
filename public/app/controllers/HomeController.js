// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

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
