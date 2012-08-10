EditUserView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.roles     = app.users.getRoles();
    me.overlay   = app.overlay;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('editUser');
    
    _.bindAll(me, 'onSaveClick');
  },
  render: function()
  {
    var me = this,
        model = me.model;
    
    me.hd
      .setTitle('Edycja użytkownika')
      .setActions({
        back: '#users/' + model.get('id'),
        doEditProgram: {
          text: 'Zapisz',
          handler: me.onSaveClick,
          right: 1
        }
      });
    
    me.bd.setHtml(me.template({
      user: model.toJSON(),
      roles: me.roles
    }));
    
    me.$('#editUserForm').submit(function() { return false; });
  },
  onSaveClick: function()
  {
    var me = this,
        $form = me.$('#editUserForm');
    
    me.overlay.show();
    
    $.ajax({
      type: 'PUT',
      url: $form.attr('action'),
      contentType: 'application/json',
      data: JSON.stringify($form.serializeForm()),
      success: function()
      {
        location.hash = 'users/' + me.model.get('id');
      },
      error: function()
      {
        alert('Nie udało się zmodyfikować użytkownika.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
  }
});