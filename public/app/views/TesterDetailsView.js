// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

TesterDetailsView = Backbone.View.extend({
  el: '#bd',
  initialize: function(options)
  {
    var me = this,
        app = options.app;
    
    me.programs = app.programs;
    me.overlay  = app.overlay;
    me.hd       = app.hd;
    me.bd       = app.bd;
    me.template = app.template('testerDetails');
    
    me.countTotalTime = app.util.countTotalTime;
    
    _.bindAll(me, 'onTesterUpdated', 'onTestProgress', 'onWindowResize');
    
    me.broker = app.broker.sandbox();
    
    var currentModel = function(message) { return message.id === me.model.get('id'); };
    
    me.broker.subscribe('testers.updated', me.onTesterUpdated).filter(currentModel);
    me.broker.subscribe('testers.progress', me.onTestProgress).filter(currentModel);
  },
  render: function()
  {
    var me = this,
        tester = me.model;
    
    me.hd
      .setTitle(tester.get('name'))
      .setActions({
        back: '#testers',
        programTester: {
          text: 'Programuj',
          privilage: 'testers.program',
          handler: function()
          {
            location.hash = '#testers/' + tester.get('id') + '/program';
          },
          right: 1
        },
        editTester: {
          text: 'Edytuj',
          privilage: 'testers.edit',
          handler: function()
          {
            location.hash = '#testers/' + tester.get('id') + '/edit';
          },
          right: 1
        },
        deleteTester: {
          text: 'Usuń',
          privilage: 'testers.delete',
          handler: function()
          {
            me.overlay.show();
            
            $.ajax({
              type: 'DELETE',
              url: '/testers/' + tester.get('id'),
              success: function()
              {
                location.hash = 'testers';
              },
              error: function()
              {
                alert('Nie udało się usunąć testera.');
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
    
    me.bd.setHtml(me.template({
      tester: tester
    }));
    
    $(window).bind('resize', me.onWindowResize).resize();
    
    me.onTesterUpdated({
      id: tester.get('id'),
      changes: tester.attributes
    });
  },
  destroy: function()
  {
    var me = this;
    
    $(window).unbind('resize', me.onWindowResize);
    
    me.broker.destroy();
    
    me.plotter  = null;
    me.plot     = null;
    me.animator = null;
  },
  onWindowResize: function()
  {
    var me = this,
        previewGraph = document.getElementById('previewGraph'),
        previewAnim = document.getElementById('previewAnim'),
        offset = $('#leds').outerHeight()
               + $('#programs').outerHeight()
               + $('#hd').outerHeight() + 10;

    var padding = parseInt($(previewGraph).css('padding')) * 2;
    
    previewAnim.width = previewGraph.width = me.$('#leds').width() - 4 - padding;
    previewAnim.height = previewGraph.height = window.innerHeight - offset - padding;
    
    if (me.plotTimeout)
    {
      clearTimeout(me.plotTimeout);
      
      delete me.plotTimeout;
    }
    
    me.plotTimeout = setTimeout(function() { if (me.plot) me.plot(); }, 250);
  },
  onTesterUpdated: function(message)
  {
    var me = this,
        tester = me.model,
        changes = message.changes;
    
    for (var property in changes)
    {
      var value = changes[property];
      
      switch (property)
      {
        case 'name':
          me.hd.setTitle(value);
          break;
        
        case 'greenLed':
        case 'orangeLed':
        case 'redLed':
          me.$('#' + property)[value ? 'removeClass' : 'addClass']('off');

          if (property === 'orangeLed' && !value)
          {
            $('#currentValues').hide();
          }
          break;
        
        case 'program':
        {
          var $chosenProgram = me.$('#chosenProgram'),
              $previewGraph = me.$('#previewGraph'),
              $previewAnim = me.$('#previewAnim'),
              text = 'Nie wybrano programu.';
          
          if (value)
          {
            var program = me.programs.get(tester.get('program' + value));

            if (program)
            {
              var operations = program.get('source');
              
              me.totalTime = me.countTotalTime(operations);
              me.totalTotalTime = me.countTotalTime(operations, true);

              if (me.plotter)
              {
                me.plotter.reset();
              }
              
              me.animator = new ProgramAnimator($previewAnim[0]);
              me.plotter = new ProgramPlotter($previewGraph[0]);
              me.plot = function()
              {
                me.plotter.plot(operations, me.totalTime);
              };
              me.plot();
              
              $previewGraph.fadeIn(function()
              {
                $previewAnim.show();
              });
              
              text = 'Program ' + value;
              
              if (program.get('name') !== text)
              {
                text += ': ' + program.get('name');
              }
            }
            else
            {
              text = 'Program ' + value + ': -';
            }
          }
          else
          {
            $previewAnim.hide();
            
            $previewGraph.fadeOut(function()
            {
              if (me.animator)
              {
                me.animator.reset();
                me.animator = null;
              }
              
              if (me.plotter)
              {
                me.plotter.reset();
                me.plotter = null;
                me.plot = null;
              }
            });
          }
          
          $chosenProgram.text(text);
          
          break;
        }
        
        case 'testing':
          me.toggleActions();
          $('#currentValues')[value ? 'show' : 'hide']();
          break;
      }
    }
  },
  onTestProgress: function(progress)
  {
    var me = this;
    
    if (!me.animator || !me.model.get('testing'))
    {
      return;
    }
    
    me.animator.animate(progress.pwmValue, progress.flatTime / 1000, me.totalTime || 0);
    
    if (!_.isUndefined(progress.loops))
    {
      me.plotter.updateLoopData(progress.loops);
    }

    var pwmValue = Math.round(progress.pwmValue);
    var timeLeft = ((me.totalTotalTime || 0) - (progress.totalTime / 1000)) / 60;

    if (timeLeft < 1)
    {
      timeLeft = 'mniej niż 1';
    }
    else
    {
      timeLeft = Math.round(timeLeft);
    }

    $('#currentPwmValue').text(pwmValue);
    $('#minsTillEndValue').text(timeLeft);
    $('#currentValues').show();
  },
  toggleActions: function()
  {
    var me = this,
        state = me.model.get('testing') ? true : false;
    
    $('#programTester').attr('disabled', state);
    $('#editTester').attr('disabled', state);
    $('#deleteTester').attr('disabled', state);
  }
});
