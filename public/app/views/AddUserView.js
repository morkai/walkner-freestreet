AddUserView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
            
    me.overlay   = app.overlay;
    me.roles     = app.users.getRoles();
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('addUser');
    
    _.bindAll(me, 'onSaveClick');
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('Nowy użytkownik')
      .setActions({
        back: '#users',
        doAddProgram: {
          text: 'Zapisz',
          handler: me.onSaveClick,
          right: 1
        }
      });
    
    me.bd.setHtml(me.template({
      roles: me.roles
    }));
    
    me.$('#addUserForm').submit(function() { return false; });
  },
  onSaveClick: function()
  {
    var me = this,
        data = me.$('#addUserForm').serializeForm(); 
    
    me.overlay.show();
    
    $.ajax({
      type: 'POST',
      url: '/users',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(tester)
      {
        location.hash = 'users';
      },
      error: function()
      {
        alert('Nie udało się dodać nowego użytkownika.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
  }
});