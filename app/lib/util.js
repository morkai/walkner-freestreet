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