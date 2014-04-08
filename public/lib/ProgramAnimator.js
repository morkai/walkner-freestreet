// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

function ProgramAnimator(canvas, options)
{
  var me = this;
  
  me.options = options || {};
  me.canvas  = canvas;
  me.context = canvas.getContext('2d');
}

ProgramAnimator.prototype.animate = function(value, time, totalTime)
{
  var me               = this,
      context          = me.context,
      pixelsPerSecond  = me.canvas.width / totalTime,
      pixelsPerPercent = me.canvas.height / 100,
      x                = time * pixelsPerSecond,
      y                = me.canvas.height - (value * pixelsPerPercent);

  me.reset();

  context.lineWidth   = 2;
  context.strokeStyle = '#FF0000';
  
  context.beginPath();
  context.arc(x, y, 7, 0, Math.PI * 2, true);
  context.stroke();
};

ProgramAnimator.prototype.reset = function()
{
  var me = this;
  
  me.context.clearRect(0, 0, me.canvas.width, me.canvas.height);
};
