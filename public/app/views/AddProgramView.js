AddProgramView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
            
    me.overlay   = app.overlay;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('addProgram');
    
    _.bindAll(me, 'onSaveClick');
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('Nowy program')
      .setActions({
        back: '#programs',
        doAddProgram: {
          text: 'Zapisz',
          handler: me.onSaveClick,
          right: 1
        }
      });
    
    me.bd.setHtml(me.template());
    
    me.$('#addProgramForm').submit(function() { return false; });
  },
  onSaveClick: function()
  {
    var me = this,
        data = me.$('#addProgramForm').serializeForm(); 
    
    me.overlay.show();
    
    $.ajax({
      type: 'POST',
      url: '/programs',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(tester)
      {
        location.hash = 'programs';
      },
      error: function()
      {
        alert('Nie udało się dodać nowego programu.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
    
    return false;
  }
});