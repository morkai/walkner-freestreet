// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

EditProgramView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.overlay   = app.overlay;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('editProgram');
    
    _.bindAll(me, 'onSaveClick', 'onWindowScroll');
    
    $(window).scroll(me.onWindowScroll);
    
    me.editor = new ProgramEditor();
  },
  render: function()
  {
    var me = this,
        model = me.model;
    
    me.hd
      .setTitle('Edycja programu')
      .setActions({
        back: '#programs/' + model.get('id'),
        doEditProgram: {
          text: 'Zapisz',
          handler: me.onSaveClick,
          right: 1
        }
      });
    
    me.bd.setHtml(me.template(model.toJSON()));
    
    me.$('#editProgramForm').submit(function() { return false; });
    
    me.$programOperations = me.$('#programOperationsPanel');
    me.originalY = me.$programOperations.position().top;
    me.legendHeight = me.$programOperations.find('legend').first().outerHeight() * 2;
    me.offsetY = $('#hd').outerHeight() + parseInt(me.$('#editProgramForm').css('padding-top'));
    
    me.editor.render(me.$('#programEditor'), me.model.get('source'));
    
    me.$('#programEditor .source').css({
      minHeight: me.$('#programEditor .operations').innerHeight() - 2
    });
  },
  destroy: function()
  {
    var me = this;
    
    $(window).unbind('scroll', me.onWindowScroll);
    
    me.editor.destroy();
  },
  onSaveClick: function()
  {
    var me = this,
        $form = me.$('#editProgramForm'),
        data = {
          name: $form.find('input[name="name"]').first().val(),
          source: me.editor.serialize()
        };
    
    me.overlay.show();
    
    $.ajax({
      type: 'PUT',
      url: $form.attr('action'),
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function()
      {
        location.hash = 'programs/' + me.model.get('id');
      },
      error: function()
      {
        alert('Nie udało się zmodyfikować programu.');
      },
      complete: function()
      {
        me.overlay.hide();
      }
    });
    
    return false;
  },
  onWindowScroll: function()
  {
    var me = this,
        marginTop = 0;
    
    if (window.scrollY > 0 && window.scrollY + me.legendHeight <= me.originalY)
    {
      marginTop = -window.scrollY;
    }
    else if (window.scrollY + me.legendHeight >= me.originalY)
    {
      marginTop = -me.originalY + me.offsetY;
    }
    
    me.$programOperations.css({marginTop: marginTop});
  }
});
