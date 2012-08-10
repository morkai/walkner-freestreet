LoginView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.overlay   = app.overlay;
    me.user      = app.user;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('login');
    
    _.bindAll(me, 'onLoginClick');
  },
  render: function()
  {
    var me = this;
    
    me.hd.setTitle('Logowanie').setActions({
      back: '#home',
      doLogin: {
        text: 'Zaloguj się',
        handler: me.onLoginClick,
        right: 1
      }
    });
    
    me.bd.setHtml(me.template());
    
    me.$('#loginForm').submit(function() { return false; });
  },
  onLoginClick: function()
  {
    var me = this;
    
    me.overlay.show();
    
    $.ajax({
      type: 'POST',
      url: '/login',
      contentType: 'application/json',
      data: JSON.stringify(me.$('#loginForm').serializeForm()),
      success: function(data)
      {
        me.user.login(data);
        
        location.hash = 'home';
      },
      error: function()
      {
        alert('Podany login i/lub hasło są niepoprawne.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
  }
});