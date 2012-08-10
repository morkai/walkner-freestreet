$(function()
{
  $.ajaxSetup({
    timeout: 5000
  });
  
  $.fn.serializeForm = function()
  {
    var data = {};
    
    this.serializeArray().forEach(function(field)
    {
      data[field.name] = field.value;
    });
    
    return data;
  };
  
  app = {};
  
  /**
   * Overlay
   */
  app.overlay = {
    show: function()
    {
      $('#overlay').fadeIn();
    },
    hide: function()
    {
      $('#overlay').fadeOut();
    }
  };
  
  /**
   * Pubsub
   */
  app.broker = new h5.pubsub.MessageBroker();
  
  /**
   * Socket.IO
   */
  app.socket = io.connect();
  app.socket.requests = {};
  app.socket.request = function(type, data, options, handler)
  {
    if (typeof options === 'function')
    {
      handler = options;
      options = {};
    }
    
    var message = {type: type, data: data};
    
    if (typeof handler === 'function')
    {
      message.id = Math.random().toString();
      
      app.socket.requests[message.id] = {
        handler: handler,
        timeout: setTimeout(
          function()
          {
            delete socket.requests[message.id];
            
            handler(new Error('Timed out.'));
          },
          options.timeout || 5000
        )
      };
    }
    
    app.socket.json.send(message);
  };
  app.socket.on('connect', function()
  {
    app.overlay.hide();
  });
  app.socket.on('disconnect', function()
  {
    app.overlay.show();
  });
  app.socket.on('message', function(message)
  {
    if (typeof message !== 'object' || typeof message.type !== 'string')
    {
      return console.log('Invalid message from the server: %s', JSON.stringify(message));
    }
    
    if (typeof message.id === 'string')
    {
      var request = app.socket.requests[message.id];
      
      if (!request)
      {
        return console.log('Invalid response from the server: %s', JSON.stringify(message));
      }
      
      clearTimeout(request.timeout);
      
      delete app.socket.requests[message.id];
      
      request.handler(null, message.data);
    }
    else
    {
      app.broker.publish(message.type, message.data);
    }
  });
  
  /**
   * User
   */
  app.user = {
    data: {},
    authenticated: false,
    role: 'user',
    login: function(user)
    {
      app.user.data          = user;
      app.user.authenticated = true;
      app.user.role          = user.role;
    },
    logout: function()
    {
      app.user.data          = {};
      app.user.authenticated = false;
      app.user.role          = 'user';
    },
    hasAccessTo: function(privilage)
    {
      if (!app.user.authenticated)
      {
        return false;
      }
      
      if (app.user.role === 'admin')
      {
        return true;
      }
      
      if (app.user.role === 'programmer')
      {
        return [
          'programs', 'testers.program'
        ].indexOf(privilage) !== -1;
      }
      
      return false;
    }
  };
  
  /**
   * Templates
   */
  app.$ = $;
  app.helpers = {
    selectTag: function(id, name, selectedValue, options)
    {
      var html = '<select id=' + id + ' name="' + name + '">';
      
      if (_.isArray(options))
      {
        options.forEach(function(value)
        {
          html += '<option value="' + value + '"';
          html += selectedValue === value ? ' selected' : '';
          html += '>' + value;
        });
      }
      else
      {
        for (var value in options)
        {
          html += '<option value="' + value + '"';
          html += selectedValue === value ? ' selected' : '';
          html += '>' + options[value];
        }
      }
      
      html += '</select>';
      
      return html;
    },
    hasAccessTo: app.user.hasAccessTo
  };
  app.templates = {};
  app.template = function(name)
  {
    if (name in app.templates)
    {
      return app.templates[name];
    }
    
    var el  = $('#' + name + 'Tpl'),
        tpl = _.template(el.html());
    
    el.remove();
    
    return app.templates[name] = function(viewData)
    {
      return tpl(_.extend(viewData || {}, app.helpers));
    };
  };
  
  /**
   * Models
   */
  app.testers = new Testers([], {
    broker: app.broker.sandbox()
  });
  app.programs = new Programs([], {
    broker: app.broker.sandbox()
  });
  app.users = new Users([], {
    broker: app.broker.sandbox()
  });
  app.tests = new Tests([], {
    broker: app.broker.sandbox()
  });
  
  /**
   * Views
   */
  app.hd = new HeaderView($, app);
  app.bd = new BodyView($);
  
  /**
   * Controllers
   */
  new HomeController(app);
  new TestersController(app);
  new ProgramsController(app);
  new UsersController(app);
  new TestsController(app);
  
  /**
   * Utilities
   */
  app.util = {
    touchList: function($el)
    {
      $el
        .delegate('a', 'touchstart', function() { $(this).addClass('active'); })
        .delegate('a', 'touchend', function() { $(this).removeClass('active'); });
    },
    countTotalTime: function(operations, loops)
    {
      var time = 0;
      
      operations.forEach(function(operation)
      {
        if (operation.time)
        {
          time += operation.time;
        }
        else if ('operations' in operation)
        {
          time += app.util.countTotalTime(operation.operations, loops) * (loops && operation.type === 'repeat' ? operation.count : 1);
        }
      });
      
      return time;
    }
  };
  
  boot = function(options)
  {
    app.testerModels = options.testerModels || {};
    
    app.testers.refresh(options.testers);
    app.programs.refresh(options.programs);
    app.users.refresh(options.users);
    
    if (options.user)
    {
      app.user.login(options.user);
    }
    
    Backbone.history.start();
    
    if (location.hash === '')
    {
      location.hash = 'home';
    }
  };
});
