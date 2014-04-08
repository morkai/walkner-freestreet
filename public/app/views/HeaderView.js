// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

HeaderView = function($, app)
{
  this.$           = $;
  this.hasAccessTo = app.user.hasAccessTo;
};

HeaderView.prototype.setTitle = function(newTitle)
{
  this.$('#hd').find('h1').text(newTitle);
  
  return this;
};

HeaderView.prototype.setActions = function(actions)
{
  var me = this,
      $hd = me.$('#hd'),
      $left = $hd.find('ul.left').empty(),
      $right = $hd.find('ul.right').empty();
  
  if (typeof actions !== 'object')
  {
    return;
  }
  
  for (var id in actions)
  {
    var action = actions[id];
    
    if (id === 'back')
    {
      $left.append('<li><a id="back" href="' + action + '" class="button">Wróć</a>');
      
      continue;
    }
    
    if ('privilage' in action && !me.hasAccessTo(action.privilage))
    {
      continue;
    }
    
    var $buttons = action.right ? $right : $left,
        $button;
    
    if (typeof action.handler === 'function')
    {
      $button = $('<input id="' + id + '" class="button" type="button" value="' + action.text + '">')
        .click(action.handler);
    }
    else
    {
      $button = $('<a id="' + id + '" class="button" href="' + action.handler + '">' + action.text + '</a>');
    }
    
    $('<li>').append($button).appendTo($buttons);
  }
  
  return this;
};
