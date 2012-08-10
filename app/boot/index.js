var bootstraps = [

  'broker',
  'db',
  'express',
  'socket',
  
  'testers',
  'programs',
  'users',
  'tests'

];

module.exports = function(app)
{
  var startTime = new Date().getTime();

  function boot(next)
  {
    if (typeof next === 'function')
    {
      bootstraps.push(next);
    }
    
    var bootstrap = bootstraps.shift();
  
    switch (typeof bootstrap)
    {
      case 'string':
        require('./' + bootstrap)(app, boot);
        break;
      
      case 'function':
        bootstrap(app, boot);
        break;
      
      default:
        console.log('--------------------------------------------------------------------------------');
        console.log("Started in %sms", new Date().getTime() - startTime);
        console.log('--------------------------------------------------------------------------------');
        break;
    }
  };
  
  boot();
};
