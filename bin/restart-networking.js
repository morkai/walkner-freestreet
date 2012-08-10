var exec = require('child_process').exec;

function check()
{
  exec('ifconfig eth0 | grep "inet addr:"', function(_, stdout)
  {
    if (stdout.indexOf('inet addr') === -1)
    {
      exec('sudo /etc/init.d/networking restart', function()
      {
        console.log('%s: restarted networking...', new Date());

        setTimeout(check, 5000);
      });
    }
    else
    {
      setTimeout(check, 10000);
    }
  });
}

check();
