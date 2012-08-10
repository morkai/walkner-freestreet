AddTesterView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
        
    me.testerModels = app.testerModels;
    me.overlay      = app.overlay;
    me.hd           = app.hd;
    me.bd           = app.bd;
    me.template     = app.template('addTester');
    
    _.bindAll(me, 'onSaveClick');
  },
  render: function()
  {
    var me = this;
    
    me.hd
      .setTitle('Nowy tester')
      .setActions({
        back: '#testers',
        doAddTester: {
          text: 'Zapisz',
          handler: me.onSaveClick,
          right: 1
        }
      });
    
    me.bd.setHtml(me.template({
      testerModels: me.testerModels
    }));
    
    me.$('#addTesterForm').submit(function() { return false; });
    
    var serialFieldset = me.$('#addTesterFormSerialConnection'),
        tcpFieldset = me.$('#addTesterFormTcpConnection');
    
    me.$('#addTesterFormType').change(function()
    {
      switch (this.value)
      {
        case 'tcp':
          serialFieldset.hide();
          tcpFieldset.show();
          break;
        
        case 'ascii':
        case 'rtu':
          tcpFieldset.hide();
          serialFieldset.show();
          break;
      }
    }).change();
  },
  onSaveClick: function()
  {
    var me = this,
        data = me.$('#addTesterForm').serializeForm(); 
    
    me.overlay.show();
    
    $.ajax({
      type: 'POST',
      url: '/testers',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(tester)
      {
        location.hash = 'testers';
      },
      error: function()
      {
        alert('Nie udało się dodać nowego testera.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
    
    return false;
  }
});