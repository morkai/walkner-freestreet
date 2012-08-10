EditTesterView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.testerModels = app.testerModels;
    me.overlay      = app.overlay;
    me.hd           = app.hd;
    me.bd           = app.bd;
    me.template     = app.template('editTester');
    
    _.bindAll(me, 'onSaveClick');
  },
  render: function()
  {
    var me = this,
        tester = me.model;
    
    me.hd
      .setTitle('Edycja testera')
      .setActions({
        back: '#testers/' + tester.get('id'),
        doAddTester: {
          text: 'Zapisz',
          handler: me.onSaveClick,
          right: 1
        }
      });
    
    me.bd.setHtml(me.template(_.extend(tester.toJSON(), {
      testerModels: me.testerModels
    })));
    
    me.$('#editTesterForm').submit(function() { return false; });
    
    var serialFieldset = me.$('#editTesterFormSerialConnection'),
        tcpFieldset = me.$('#editTesterFormTcpConnection');
    
    me.$('#editTesterFormType').change(function()
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
        id = me.model.get('id'),
        $form = me.$('#editTesterForm');
    
    me.overlay.show();
    
    $.ajax({
      type: 'PUT',
      url: $form.attr('action'),
      contentType: 'application/json',
      data: JSON.stringify($form.serializeForm()),
      success: function(tester)
      {
        location.hash = 'testers/' + id;
      },
      error: function()
      {
        alert('Nie udało się zmodyfikować danego testera.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
    
    return false;
  }
});