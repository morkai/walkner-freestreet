ProgramDetailsView = Backbone.View.extend({
  events: {
    'click #programDetailsFormats .button': 'changeFormat'
  },
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
            
    me.overlay   = app.overlay;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('programDetails');
    
    me.countTotalTime = app.util.countTotalTime;
    
    _.bindAll(me, 'onWindowResize');
    
    $(window).resize(me.onWindowResize);
  },
  render: function()
  {
    var me = this,
        model = this.model;
    
    me.
      hd.setTitle(model.get('name'))
      .setActions({
        back: '#programs',
        editProgram: {
          text: 'Edytuj',
          handler: '#programs/' + model.get('id') + '/edit',
          right: 1
        },
        deleteProgram: {
          text: 'Usuń',
          handler: function()
          {
            me.overlay.show();
            
            $.ajax({
              type: 'DELETE',
              url: '/programs/' + model.get('id'),
              success: function()
              {
                location.hash = 'programs';
              },
              error: function()
              {
                alert('Nie udało się usunąć programu.');
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
    
    var source = model.get('source'),
        totalTime = me.countTotalTime(source);
    
    me.bd.setHtml(me.template({
      text: operations.toText(source),
      code: operations.toCode(source)
    }));
    
    var plotter = new ProgramPlotter(document.getElementById('programGraph'));
    
    me.plot = function() { plotter.plot(source, totalTime); };
    
    me.onWindowResize();
  },
  destroy: function()
  {
    var me = this;
    
    $(window).unbind('resize', me.onWindowResize);
  },
  changeFormat: function(e)
  {
    var me = this,
        $btn = me.$(e.target);
    
    if ($btn.hasClass('active'))
    {
      return;
    }
    
    me.$('#' + $('#programDetailsFormats .active').removeClass('active').attr('data-for')).hide();
    me.$('#' + $btn.addClass('active').attr('data-for')).fadeIn();
  },
  onWindowResize: function()
  {
    var me = this,
        previewGraph = document.getElementById('programGraph'),
        offset = $('#hd').outerHeight() + $('#programDetailsFormats').outerHeight() + 10;

    var padding = parseInt($(previewGraph).css('padding')) * 2;

    previewGraph.width = window.innerWidth - 27 - padding;
    previewGraph.height = window.innerHeight - offset - padding;
    
    if (me.plotTimeout)
    {
      clearTimeout(me.plotTimeout);
      
      delete me.plotTimeout;
    }
    
    me.plotTimeout = setTimeout(function() { if (me.plot) me.plot(); }, 250);
  }
});
