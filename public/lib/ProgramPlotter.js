function ProgramPlotter(canvas, options)
{
  var me = this;
  
  me.totalTime = 0;
  me.program   = [];
  
  me.loop = 0;
  me.nestedLoops = [];
      
  me.options = options || {};
  me.canvas  = canvas;
  me.context = canvas.getContext('2d');
}

ProgramPlotter.prototype.plot = function(program, totalTime)
{
  var me = this;
  
  me.totalTime = totalTime;
  me.program = program;
  
  me.reset();
  me.program.forEach(function(operation)
  {
    me.plotOperation(operation);
  });
};

ProgramPlotter.prototype.updateLoopData = function(loops)
{
  var me = this;
  
  me.loops = loops;
  
  me.reset();
  me.program.forEach(function(operation)
  {
    me.plotOperation(operation);
  });
}

/**
 * @private
 */
ProgramPlotter.prototype.plotOperation = function(operation)
{
  var plotter = ProgramPlotter.operations[operation.type];
  
  if (!plotter)
  {
    throw new Error(
      'Operation of type [' + operation.type + '] is not supported.'
    );
  }
  
  plotter.call(this, operation);
};

/**
 * @private
 */
ProgramPlotter.prototype.reset = function()
{
  var me = this,
      canvas = me.canvas;
  
  me.context.clearRect(0, 0, canvas.width, canvas.height);
  
  me.loop = 0;
  me.nestedLoops = [];
  
  me.x = 0;
  me.y = canvas.height - 1;
  me.pixelsPerSecond = canvas.width / me.totalTime;
  me.pixelsPerPercent = canvas.height / 100;
};

/**
 * @protected
 */
ProgramPlotter.prototype.drawLine = function(fromX, fromY, toX, toY, styles)
{
  var me = this,
      context = me.context;
  
  me.setLineStyles(styles);
  
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.stroke();
};

/**
 * @author http://vetruvet.blogspot.com/2010/10/drawing-dashed-lines-on-html5-canvas.html
 * @protected
 */
ProgramPlotter.prototype.drawDashedLine =
  function(fromX, fromY, toX, toY, styles)
{
  var me = this,
      context = me.context,
      dashLength = 6,
      dX = toX - fromX,
      dY = toY - fromY,
      dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLength),
      dashX = dX / dashes,
      dashY = dY / dashes,
      q = 0;
  
  me.setLineStyles(styles);
  
  context.beginPath();
  context.moveTo(fromX, fromY);
  
  while (q++ < dashes)
  {
    fromX += dashX;
    fromY += dashY;
   
    context[q % 2 == 0 ? 'moveTo' : 'lineTo'](fromX, fromY);
  }
  
  context[q % 2 == 0 ? 'moveTo' : 'lineTo'](toX, toY);
  
  context.stroke();
  context.closePath();
};

/**
 * @protected
 */
ProgramPlotter.prototype.setLineStyles = function(styles)
{
  this.context.strokeStyle = styles.strokeStyle || 'black';
  this.context.lineWidth = styles.lineWidth || 3;
};

ProgramPlotter.operations = {
  repeat: function(operation)
  {
    var me = this,
        startX = me.x,
        lineStyles = me.options.repeatStyles || {
          strokeStyle: '#CCC',
          lineWidth: 2
        },
        fontStyles = me.options.repeatFontStyles || {
          fillStyle: '#333',
          font: '24px Arial, sans-serif'
        },
        count = 1;
    
    me.nestedLoops.push(operation.count || 1);
    
    operation.operations.forEach(function(operation)
    {
      me.plotOperation(operation);
    });
    
    me.nestedLoops.forEach(function(c) { count *= c; });
    me.nestedLoops.pop();
    
    me.drawDashedLine(startX, 0, startX, me.canvas.height, lineStyles);
    me.drawDashedLine(me.x, 0, me.x, me.canvas.height, lineStyles);
    
    for (var property in fontStyles)
    {
      me.context[property] = fontStyles[property];
    }
    
    var prefix = '';
    
    if (me.loops)
    {
      prefix = (me.loops[me.loop++] || 0) + '/';
    }
    
    me.context.fillText(prefix + count, startX + 10, 28);
  },
  wait: function(operation)
  {
    var me = this,
        fromX = me.x,
        styles = me.options.waitStyles || {
          strokeStyle: '#666'
        };
    
    me.x += (me.pixelsPerSecond * (operation.time || 0));
    
    me.drawLine(fromX, me.y, me.x, me.y, styles);
  },
  beep: function(operation)
  {
    var me = this,
        fromX = me.x,
        styles = me.options.waitStyles || {
          strokeStyle: '#C60'
        };
    
    me.x += (me.pixelsPerSecond * (operation.time || 0));
    
    me.drawLine(fromX, me.y, me.x, me.y, styles);
  },
  shutdown: function(operation)
  {
    var me = this,
        fromX = me.x,
        styles = me.options.shutdownStyles || {
          strokeStyle: '#666'
        };

    me.x += (me.pixelsPerSecond * (operation.time || 0));

    me.drawDashedLine(fromX, me.y, me.x, me.y, styles);
  },
  pwm: function(operation)
  {
    var me = this,
        canvas = me.canvas,
        fromX = me.x < canvas.width ? me.x : (canvas.width - 1),
        fromY = me.y,
        styles = {
          strokeStyle: '#06C'
        };
    
    me.x += (me.pixelsPerSecond * (operation.time || 0)),
    me.y = canvas.height - (me.pixelsPerPercent * (operation.value || 0));
    
    if (me.x >= canvas.width)
    {
      me.x = canvas.width - 1;
    }
    
    if (me.y >= canvas.height)
    {
      me.y = canvas.height - 1;
    }
    
    me.drawLine(fromX, fromY, me.x, me.y, styles);
  }
};
