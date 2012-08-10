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
