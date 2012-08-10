var $ = require('jquery');
var fs = require('fs');
var crypto = require('crypto');

var basedir = __dirname + '/../docs/';

var processed = 0;
var toProcess = 0;

fs.readFile(basedir + 'index.html', 'utf8', function(err, html)
{
  if (err) throw err;

  var doc = $(html);
  var imgs = doc.find('img');

  toProcess = imgs.length;

  doc.find('img').each(function()
  {
    processImg(this, doc);
  });
});

function processImg(img, doc)
{
  fs.readFile(basedir + img.src, function(err, data)
  {
    if (err) throw err;

    img.src = 'data:image/png;base64,' + data.toString('base64');

    if (++processed === toProcess)
    {
      saveDoc(doc);
    }
  });
}

function saveDoc(doc)
{
  var html = '<!DOCTYPE html>';

  for (var i= 0; i < doc.length; ++i)
  {
    html += doc[i].outerHTML || '';
  }

  fs.writeFile(basedir + 'index.htm', html, 'utf8');
}
