// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

UserDetailsView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.overlay   = app.overlay;
    me.roles     = app.users.getRoles();
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('userDetails');
  },
  render: function()
  {
    var me = this,
        model = me.model;
    
    me.hd
      .setTitle('Użytkownik')
      .setActions({
        back: '#users',
        editProgram: {
          text: 'Edytuj',
          handler: '#users/' + model.get('id') + '/edit',
          right: 1
        },
        deleteProgram: {
          text: 'Usuń',
          handler: function()
          {
            me.overlay.show();
            
            $.ajax({
              type: 'DELETE',
              url: '/users/' + model.get('id'),
              success: function()
              {
                location.hash = 'users';
              },
              error: function()
              {
                alert('Nie udało się usunąć użytkownika.');
              },
              complete: function()
              {
                me.overlay.hide();
              }
            });
          },
          right: 1
        }
      });
    
    var user = me.model.toJSON();
    
    user.role = me.roles[user.role];
    
    me.bd.setHtml(me.template({
      user: user
    }));
  }
});
