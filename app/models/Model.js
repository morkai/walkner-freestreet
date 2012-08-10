var _ = require('underscore'),
    docIdToHex = require('../lib/util').docIdToHex;

var Model = module.exports = function(app, doc)
{
  this.app = app;
  this.broker = app.broker.sandbox();
  
  this.doc = _.defaults(doc || {}, this.defaults || {});
  
  this.changes = {};
};

Model.prototype.toJSON = function()
{
  return docIdToHex(_.clone(this.doc));
};

Model.prototype.get = function(property)
{
  return property === 'id'
    ? this.doc._id.toHexString()
    : this.doc[property];
};

Model.prototype.set = function(changes)
{
  for (var property in changes)
  {
    if (!this.doc.hasOwnProperty(property))
    {
      continue;
    }
    
    var newValue = changes[property];
    
    if (this.doc[property] !== newValue)
    {
      this.doc[property] = property in this.setters ? this.setters[property](newValue) : newValue;
      this.changes[property] = 1;
    }
  }
  
  return this;
};

Model.prototype.save = function(cb)
{
  var me = this;
  
  if (!cb)
  {
    cb = function() {};
  };

  me.app.db.collection(me.collectionName, function(err, coll)
  {
    if (err)
    {
      cb(err);
    }
    else if (_.isUndefined(me.doc._id))
    {
      me.insert(coll, cb);
    }
    else
    {
      me.update(coll, cb);
    }
  });
  
  return me;
};

Model.prototype.destroy = function(cb)
{
  var me = this;
  
  if (!cb)
  {
    cb = function() {};
  };
  
  me.app.db.collection(me.collectionName, function(err, coll)
  {
    if (err)
    {
      return cb(err);
    }
    
    coll.remove({_id: me.doc._id}, {safe: true}, function(err)
    {
      if (err)
      {
        return cb(err);
      }
      
      var id = me.get('id');
      
      cb(null, id);
      
      function destroy()
      {
        me.broker.publish(me.namespaceName + '.destroyed', id);
        me.broker.destroy();
        
        me.app = me.broker = null;
      }
      
      if (_.isFunction(me.onDestroy))
      {
        me.onDestroy(destroy);
      }
      else
      {
        destroy();
      }
    });
  });
  
  return me;
};

/**
 * @private
 */
Model.prototype.insert = function(coll, cb)
{
  var me = this;
  
  coll.insert(me.doc, {safe: true}, function(err, doc)
  {
    if (err)
    {
      return cb(err);
    }
    
    me.doc = doc[0];
    
    cb(null, me);
    
    me.broker.publish(me.namespaceName + '.created', me);
  });
};

/**
 * @private
 */
Model.prototype.update = function(coll, cb)
{
  var me = this,
      changes = {};
  
  if (Object.keys(me.changes).length === 0)
  {
    return cb(null, changes);
  }
  
  for (var property in me.changes)
  {
    changes[property] = me.doc[property];
  }
  
  coll.update({_id: me.doc._id}, {$set: changes}, {safe: true}, function(err)
  {
    if (err)
    {
      return cb(err);
    }
    
    cb(null, changes);
    
    me.broker.publish(me.namespaceName + '.updated', {
      id: me.get('id'),
      changes: changes
    });
    
    me.changes = {};
    
    if (_.isFunction(me.onUpdate))
    {
      me.onUpdate(changes);
    }
  });
};
