// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

TestDetailsView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.tests     = app.tests;
    me.overlay   = app.overlay;
    me.hd        = app.hd;
    me.bd        = app.bd;
    me.template  = app.template('testDetails');

    me.countTotalTime = app.util.countTotalTime;
    
    _.bindAll(me, 'onWindowResize');
    
    $(window).resize(me.onWindowResize);
  },
  render: function()
  {
    var me = this,
        model = this.model;
    
    me.
      hd.setTitle('Test')
      .setActions({
        back: '#tests'
      });
    
    var source = model.get('source'),
        totalTime = me.countTotalTime(source);
    
    me.bd.setHtml(me.template({
      test: model.readable()
    }));
    
    var graph = document.getElementById('previewGraph');
    
    graph.style.display = 'block';

    var plotter = new ProgramPlotter(graph);
    
    me.plot = function() { plotter.plot(source, totalTime); };

    me.onWindowResize();
    setTimeout(function() { me.onWindowResize(); }, 200);
  },
  destroy: function()
  {
    var me = this;
    
    $(window).unbind('resize', me.onWindowResize);

    me.tests.setClearTimer();
  },
  onWindowResize: function()
  {
    var me = this,
        previewGraph = document.getElementById('previewGraph'),
        offset = $('#hd').outerHeight(true) + $('#testDetails').outerHeight() + 45;

    previewGraph.width = $('#testDetails').innerWidth();
    previewGraph.height = Math.max(200, window.innerHeight - offset);

    $(previewGraph)[previewGraph.height == 200 ? 'addClass' : 'removeClass']('detached');

    if (me.plotTimeout)
    {
      clearTimeout(me.plotTimeout);
      
      delete me.plotTimeout;
    }
    
    me.plotTimeout = setTimeout(function() { if (me.plot) me.plot(); }, 250);
  }
});
