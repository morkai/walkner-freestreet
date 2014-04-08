// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

var fs = require('fs'),
    ObjectID = require('mongodb').BSONPure.ObjectID;

exports.initDir = function(path, app)
{
  fs.readdir(path, function(err, files)
  {
    if (err)
    {
      throw err;
    }
    
    files.filter(function(file) { return file.indexOf('.js', file.length - 3) !== -1; })
         .map(function(file) { return path + file; })
         .forEach(function(file) { require(file)(app); });
  });
};

exports.docIdToHex = function(doc)
{
  if (typeof doc === 'object' && '_id' in doc)
  {
    doc.id = doc._id.toHexString();
    
    delete doc._id;
  }
  
  return doc;
};

exports.hexToDocId = function(hex)
{
  return ObjectID.createFromHexString(id);
};
