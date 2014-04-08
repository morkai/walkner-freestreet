// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

BodyView = function($)
{
  this.$           = $;
  this.currentView = null;
};

BodyView.prototype.setView = function(newView)
{
  var me = this,
      oldView = me.currentView;
  
  if (oldView && 'destroy' in oldView)
  {
    oldView.destroy();
  }
  
  newView.render();
  
  me.currentView = newView;
};

BodyView.prototype.setHtml = function(newHtml)
{
  this.$('#bd').html(newHtml);
};
