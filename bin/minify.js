var exec = require('child_process').exec;
var fs = require('fs');

var publicDir = __dirname + '/../public';

var input = [
  publicDir + '/app/models/User.js',
  publicDir + '/app/models/Users.js',
  publicDir + '/app/models/Tester.js',
  publicDir + '/app/models/Testers.js',
  publicDir + '/app/models/Program.js',
  publicDir + '/app/models/Programs.js',
  publicDir + '/app/models/Test.js',
  publicDir + '/app/models/Tests.js',
  publicDir + '/app/controllers',
  publicDir + '/app/views',
  publicDir + '/app/app.js',
  publicDir + '/lib/operations.js',
  publicDir + '/lib/ProgramEditor.js',
  publicDir + '/lib/ProgramPlotter.js',
  publicDir + '/lib/ProgramAnimator.js'
];

var output = {};
var minifiedCount = 0;
var minifyLimit = input.length;

input.forEach(minify);

function minify(entry)
{
  fs.stat(entry, function(err, stats)
  {
    if (stats.isFile())
    {
      process.nextTick(function() { minifyFile(entry) });
    }
    else
    {
      fs.readdir(entry, function(err, files)
      {
        --minifyLimit;

        files.filter(function(file) { return file.substr(file.length - 3) === '.js'; }).forEach(function(file)
        {
          ++minifyLimit;

          process.nextTick(function() { minifyFile(entry + '/' + file, entry); });
        });
      });
    }
  });
}

function minifyFile(file, entry)
{
  if (!entry) entry = file;

  if (!output[entry]) output[entry] = '';

  exec('yuicompressor ' + file, function(err, stdout)
  {
    console.log('Compressed %s', file);
    
    output[entry] += stdout.substr(stdout.replace('\r\n', '\n').replace('\r', '\n').indexOf('\n', 1));

    if (++minifiedCount === minifyLimit)
    {
      process.nextTick(saveOutput);
    }
  });
}

function saveOutput()
{
  var fd = fs.openSync(publicDir + '/min.js', 'w');

  input.forEach(function(entry)
  {
    fs.writeSync(fd, output[entry]);
  });

  fs.close(fd);

  exec('yuicompressor ' + publicDir + '/app.css', function(err, stdout)
  {
    fs.writeFile(publicDir + '/min.css', stdout.substr(stdout.replace('\r\n', '\n').replace('\r', '\n').indexOf('\n', 1)));
  });
}
