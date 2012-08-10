module.exports = function(app)
{
  var templates = [];
  
  require('fs').readdir(__dirname + '/../views/templates', function(err, files)
  {
    if (err)
    {
      throw err;
    }
    
    var re = /\.ejs$/;
    
    files.forEach(function(file)
    {
      if (re.test(file))
      {
        templates.push({
          name: file.substring(0, file.length - 4),
          path: 'templates/' + file
        });
      }
    });
  });
  
  app.get('/', function(req, res)
  {
    app.testers.getBy(null, function(err, testers)
    {
      if (err)
      {
        return res.send(err, 400);
      }
      
      app.programs.getBy(null, function(err, programs)
      {
        if (err)
        {
          return res.send(err, 400);
        }
        
        app.users.getBy(null, function(err, users)
        {
          if (err)
          {
            return res.send(err, 400);
          }
        
          var testerModels = {};
          
          for (var key in app.testers.config.models)
          {
            testerModels[key] = app.testers.config.models[key].name;
          }
          
          res.render('index.ejs', {
            layout: false,
            testers: testers,
            testerModels: testerModels,
            programs: programs,
            users: users,
            templates: templates,
            user: req.session.user
          });
        });
      });
    });
  });
};
