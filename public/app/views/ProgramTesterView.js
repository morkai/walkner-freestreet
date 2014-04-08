// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

ProgramTesterView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.programs = app.programs;
    me.overlay  = app.overlay;
    me.hd       = app.hd;
    me.bd       = app.bd;
    me.template = app.template('programTester');
    
    _.bindAll(me, 'onSaveClick');
  },
  render: function()
  {
    var me = this,
        tester = me.model;
    
    me.hd
      .setTitle('Programowanie testera')
      .setActions({
        back: '#testers/' + tester.get('id'),
        doProgramTester: {
          text: 'Zapisz',
          handler: me.onSaveClick,
          right: 1
        }
      });
    
    me.bd.setHtml(me.template({
      id: tester.get('id'),
      name: tester.get('name'),
      program1: tester.get('program1'),
      program2: tester.get('program2'),
      programs: me.programs.getNamesMap()
    }));
    
    me.$('#programTesterForm').submit(function() { return false; });
  },
  onSaveClick: function()
  {
    var me = this,
        id = me.model.get('id'),
        $form = me.$('#programTesterForm');
    
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
        alert('Nie udało się zaprogramować danego testera.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
    
    return false;
  }
});
