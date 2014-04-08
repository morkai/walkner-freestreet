// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

(function(root)
{
  function ProgramEditor()
  {
    var me = this;
    
    me.rendered = false;
    me.currentTarget = null;
    
    _.bindAll(me, 'handleNewDrop', 'handleExistingDrop', 'manageCurrentTarget');
  }
  
  ProgramEditor.prototype.destroy = function()
  {
    if (!this.rendered)
    {
      return;
    }
    
    this.$operations.empty();
    this.$source.empty();
    
    this.$operations = this.$source = null;
  };
  
  ProgramEditor.prototype.render = function($root, source)
  {
    var me = this;
    
    if (me.rendered)
    {
      me.destroy();
    }
    
    me.rendered = true;
    
    me.$operations = $root.find('.operations').first();
    me.$source = $root.find('.source').first();
    
    me.renderOperations();
    me.renderSource(source);
    
    me.$source.droppable({
      accept: '.operation',
      activeClass: 'acceptableTarget',
      hoverClass: 'validTarget',
      greedy: false,
      drop: function(e, ui)
      {
        if (ui.helper.hasClass('helper'))
        {
          me.handleNewDrop(e, ui, me.$source);
        }
        else
        {
          me.handleExistingDrop(e, ui, me.$source);
        }
      }
    });
    
    me.$source
      .mousemove(me.manageCurrentTarget)
      .mouseout(function()
      {
        me.currentTarget = null;
        
        me.$source.parent().find('.currentTarget').removeClass('currentTarget');
      });
  }
  
  ProgramEditor.prototype.renderOperations = function()
  {
    for (var type in ProgramEditor.operations)
    {
      ProgramEditor.operations[type].renderOperation.call(this);
    }
  };
  
  ProgramEditor.prototype.renderSource = function(source)
  {
    var me = this;
    
    me.$source.empty();
    
    _.each(source || [], function(op)
    {
      $('<li>').append(ProgramEditor.operations[op.type].renderSource.call(me, op, me.$source))
               .appendTo(me.$source);
    });
  };
  
  ProgramEditor.prototype.serialize = function($op)
  {
    var me = this;
    
    if ($op)
    {
      return ProgramEditor.operations[$op.attr('data-type')].serialize.call(me, $op);
    }
    
    var operations = [];
    
    this.$source.find('> li > .op').each(function(i, op)
    {
      var $op = $(op);
      
      operations.push(
        ProgramEditor.operations[$op.attr('data-type')].serialize.call(me, $op)
      );
    });
    
    return operations;
  };
  
  ProgramEditor.prototype.createOperationElement = function(helper)
  {
    return helper.clone().removeAttr('id').removeClass('helper ui-draggable-dragging').css({
      position: 'relative',
      top: 0,
      left: 0,
      zIndex: 0,
      display: 'inline-block'
    }).addClass('operation').draggable({
      zIndex: 1000,
      revert: 'invalid',
      stop: function() { $.ui.ddmanager.current = null; }
    });
  };
  
  ProgramEditor.prototype.handleNewDrop = function(e, ui, $parent)
  {
    var me = this,
        $op = me.createOperationElement(ui.helper),
        $li = $('<li>');
    
    $li.append($op).appendTo($parent);
    
    var operation = ProgramEditor.operations[$op.attr('data-type')];
    
    if (!_.isUndefined(operation) && _.isFunction(operation.drop))
    {
      operation.drop.call(me, $op, $parent);
    }
  };
  
  ProgramEditor.prototype.handleExistingDrop = function(e, ui, $parent)
  {
    var $op = ui.draggable;
    
    $op.css({top: 0, left: 0, zIndex: 0}).closest('li').appendTo($parent);
  };
  
  ProgramEditor.prototype.manageCurrentTarget = function(e)
  {
    var me = this;
    
    if ($.ui.ddmanager.current || e.srcElement === me.currentTarget)
    {
      return;
    }
    
    var $this = $(e.srcElement);
    
    if (e.srcElement.id !== 'source' && !$this.hasClass('op'))
    {
      $this = $this.closest('.op');
    }
    
    if ($this[0] === me.currentTarget)
    {
      return;
    }
    
    if (me.currentTarget)
    {
      $(me.currentTarget).removeClass('currentTarget');
    }
    
    $currentTarget = $(document.elementFromPoint(e.pageX - pageXOffset, e.pageY - pageYOffset));
    
    if (!$currentTarget.hasClass('op'))
    {
      $currentTarget = $currentTarget.closest('.op');
      
      if (!$currentTarget.length)
      {
        $currentTarget = me.$source;
      }
    }
    
    $currentTarget.addClass('currentTarget');
    
    me.currentTarget = $currentTarget[0];
    
    me.toggleRemoveButton();
  };
  
  ProgramEditor.prototype.toggleRemoveButton = function()
  {
    var me = this;
      
    me.$source.find('input.removeOperation').remove();
    
    if (me.currentTarget)
    {
      var $currentTarget = $(me.currentTarget);
      
      $('<input class="removeOperation" type="button" value="x">').click(function()
      {
        if ($currentTarget[0] === me.$source[0])
        {
          $currentTarget.children().fadeOut(function() { $currentTarget.empty(); });
        }
        else
        {
          $currentTarget.closest('li').fadeOut(function() { $(this).remove(); });
        }
      }).appendTo($currentTarget);
    }
  };
  
  ProgramEditor.prototype.countTotalTime = function(op)
  {
    var me = this,
        time = op.time || 0;
    
    _.each(op.operations || [], function(op) { time += me.countTotalTime(op); });
    
    return time;
  };
  
  function renderOperation(type)
  {
    var operation = ProgramEditor.operations[type],
        $operation = $('<div class="operation">' + operation.name + '</div>'),
        $helper = $('#' + type + 'Helper').clone().show().removeAttr('id');
    
    this.$operations.append(
      $('<li></li>').append($operation)
    );
    
    $operation.draggable({
      zIndex: 1000,
      helper: function() { return $helper; },
      stop: function() { $.ui.ddmanager.current = null; }
    });
    
    $('#' + type + 'Helper').hide();
  }
  
  ProgramEditor.operations = {
    repeat: {
      name: 'Powtarzaj',
      renderOperation: function()
      {
        renderOperation.call(this, 'repeat');
      },
      renderSource: function(op, $parent)
      {
        var me = this,
            $op = me.createOperationElement($('#repeatHelper'));
        
        $op.find('> input[name="count"]').first().val(op.count);
        
        ProgramEditor.operations.repeat.drop.call(me, $op, $parent);
        
        var $children = $op.find('> ol');
        
        _.each(op.operations, function(op)
        {
          $('<li>').append(ProgramEditor.operations[op.type].renderSource.call(me, op, $children))
                   .appendTo($children);
        });
        
        return $op;
      },
      drop: function($op, $parent)
      {
        var me = this,
            $children = $('<ol></ol>').appendTo($op);
        
        $op.droppable({
          accept: '.operation',
          activeClass: 'acceptableTarget',
          hoverClass: 'validTarget',
          greedy: true,
          drop: function(e, ui)
          {
            if (ui.helper.hasClass('helper'))
            {
              me.handleNewDrop(e, ui, $children);
            }
            else
            {
              me.handleExistingDrop(e, ui, $children);
            }
          }
        });
      },
      serialize: function($op)
      {
        var me = this,
            count = parseInt($op.find('> input[name="count"]').first().val()),
            time = parseFloat($op.find('> input[name="time"]').first().val()),
            operations = [];
        
        $op.find('> ol:first > li > .op').each(function(i, op)
        {
          operations.push(me.serialize($(op)));
        });
        
        if (isNaN(count) || count === 0)
        {
          if (isNaN(time))
          {
            count = 1;
          }
          else
          {
            count = Math.floor(
              time / me.countTotalTime({operations: operations})
            );
          }
        }
        
        return {
          type: 'repeat',
          count: count,
          operations: operations
        };
      }
    },
    wait: {
      name: 'Czekaj',
      renderOperation: function()
      {
        renderOperation.call(this, 'wait');
      },
      renderSource: function(op, $parent)
      {
        var me = this,
            $op = me.createOperationElement($('#waitHelper'));
        
        $op.find('> input[name="time"]').first().val(op.time);
        
        return $op;
      },
      serialize: function($op)
      {
        var me = this,
            time = parseFloat($op.find('> input[name="time"]').first().val());
        
        return {
          type: 'wait',
          time: isNaN(time) ? 1 : time
        };
      }
    },
    beep: {
      name: 'Brzęcz',
      renderOperation: function()
      {
        renderOperation.call(this, 'beep');
      },
      renderSource: function(op, $parent)
      {
        var me = this,
            $op = me.createOperationElement($('#beepHelper'));
        
        $op.find('> input[name="time"]').first().val(op.time);
        
        return $op;
      },
      serialize: function($op)
      {
        var me = this,
            time = parseFloat($op.find('> input[name="time"]').first().val());
        
        return {
          type: 'beep',
          time: isNaN(time) ? 1 : time
        };
      }
    },
    shutdown: {
      name: 'Wyłącz',
      renderOperation: function()
      {
        renderOperation.call(this, 'shutdown');
      },
      renderSource: function(op, $parent)
      {
        var me = this,
            $op = me.createOperationElement($('#shutdownHelper'));

        $op.find('> input[name="time"]').first().val(op.time);

        return $op;
      },
      serialize: function($op)
      {
        var me = this,
            time = parseFloat($op.find('> input[name="time"]').first().val());

        return {
          type: 'shutdown',
          time: isNaN(time) ? 1 : time
        };
      }
    },
    pwm: {
      name: 'Zmień natężenie',
      renderOperation: function()
      {
        renderOperation.call(this, 'pwm');
      },
      renderSource: function(op, $parent)
      {
        var me = this,
            $op = me.createOperationElement($('#pwmHelper'));
        
        $op.find('> input[name="value"]').first().val(op.value);
        $op.find('> input[name="time"]').first().val(op.time);
        
        return $op;
      },
      serialize: function($op)
      {
        var me = this,
            value = parseInt($op.find('> input[name="value"]').first().val()),
            time = parseFloat($op.find('> input[name="time"]').first().val());
        
        return {
          type: 'pwm',
          value: isNaN(value) ? 0 : value,
          time: isNaN(time) ? 0 : time
        };
      }
    }
  };
  
  root.ProgramEditor = ProgramEditor;
})(window);
