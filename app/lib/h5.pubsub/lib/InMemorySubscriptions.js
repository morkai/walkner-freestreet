(function(Subscriptions, root) {

  var InMemorySubscriptions = function() {
    
    Subscriptions.call(this);

    this._tree = new InMemorySubscriptions.Tree();
    this._all = {};
    
  };
  
  var def = InMemorySubscriptions.prototype = new Subscriptions();

  def.send = function(topic, message) {
    
    sendToSpecified(this._all, topic, message);
    this._tree.send(getPath(topic), topic, message);
    
  };

  def.add = function(subscription) {
    
    var self = this,
        path = getPath(subscription.topic);

    if (path[0] === Subscriptions.TOKEN.ALL) {
      subscription.onCancel(function() { delete self._all[this.id]; });
      this._all[subscription.id] = subscription;
    } else {
      this._tree.add(path, subscription);
    }
    
  };

  def.cancelByTopic = function(topic) {
    
    var path = getPath(topic);

    if (path[0] === Subscriptions.TOKEN.ALL) {
      cancelSpecified(this._all, null);
    } else {
      this._tree.cancel(path);
    }
    
  };

  def.cancelByCallback = function(topic, callback) {
    
    var path = getPath(topic),
        filter = function(sub) { return sub.callback === callback; };

    if (path[0] === Subscriptions.TOKEN.ALL) {
      cancelSpecified(this._all, filter);
    } else {
      this._tree.cancel(path, filter);
    }
    
  };

  def.cancelAll = function() {
    
    cancelSpecified(this._all, null);
    this._tree.cancelAll();
    
  };

  def.gc = function() {
    
    this._tree.gc();
    
  };

  def.destroy = function() {
    
    this._tree.destroy();

    cancelSpecified(this._all);

    for (var property in this) delete this[property];
    
  };

  InMemorySubscriptions.Tree = function() {
    
    this._children      = {};
    this._all           = {};
    this._subscriptions = {};
    
  };

  InMemorySubscriptions.Tree.prototype = {

    send: function(path, topic, message) {
      
      if (!this._children) {
        return;
      }
      
      sendToSpecified(this._all, topic, message);

      var token = path.shift();

      if (token === undefined) {
        sendToSpecified(this._subscriptions, topic, message);
      } else {
        if (Subscriptions.TOKEN.ANY in this._children) {
          this._children[Subscriptions.TOKEN.ANY].send([].concat(path), topic, message);
        }

        if (token in this._children) {
          this._children[token].send(path, topic, message);
        }
      }
      
    },

    add: function(path, subscription) {
      
      var self = this,
          token = path.shift();

      if (token === undefined) {
        subscription.onCancel(function() {
          delete self._subscriptions[this.id];
        });
        this._subscriptions[subscription.id] = subscription;
      } else if (token === Subscriptions.TOKEN.ALL) {
        if (path.length !== 0) {
          throw new Error('[' + Subscriptions.TOKEN.ALL + '] cannot be used ' +
                          'at the end of a topic.');
        }

        subscription.onCancel(function() { delete self._all[this.id]; });

        this._all[subscription.id] = subscription;
      } else {
        if (!(token in this._children)) {
          this._children[token] = new InMemorySubscriptions.Tree();
        }

        this._children[token].add(path, subscription);
      }
      
    },

    cancelAll: function() {
      
      cancelSpecified(this._all);
      cancelSpecified(this._subscriptions);

      for (var token in this._children) {
        this._children[token].cancelAll();
      }
      
    },

    cancel: function(path, filter) {
      
      var token = path.shift();

      if (token === undefined) {
        cancelSpecified(this._subscriptions, filter);
      } else if (token === Subscriptions.TOKEN.ALL) {
        cancelSpecified(this._all, filter);
      } else if (token in this._children) {
        this._children[token].cancel(path, filter);
      }
      
    },

    isEmpty: function() {
      
      var subscriptionId, token;
      
      for (subscriptionId in this._all) {
        return false;
      }

      for (subscriptionId in this._subscriptions) {
        return false;
      }

      for (token in this._children) {
        if (!this._children[token].isEmpty()) {
          return false;
        }
      }

      return true;
      
    },

    gc: function() {
      
      for (var token in this._children) {
        this._children[token].gc();

        if (this._children[token].isEmpty()) {
          delete this._children[token];
        }
      }
      
    },

    destroy: function() {
      
      if (this.destroyed) {
        return;
      }
      
      for (var token in this._children) {
        this._children[token].destroy();
      }

      cancelSpecified(this._all);
      cancelSpecified(this._subscriptions);

      for (var property in this) delete this[property];
      
    }

  };

  function getPath(topic) {
    
    return topic.split(Subscriptions.TOKEN.SEPARATOR)
                .filter(function(token) { return token !== ''; });
    
  }

  function sendToSpecified(subscriptions, topic, message) {
    
    for (var subscriptionId in subscriptions) {
      subscriptions[subscriptionId].send(topic, message);
    }
    
  }

  function cancelSpecified(subscriptions, filter) {
    
    for (var subscriptionId in subscriptions)  {
      var subscription = subscriptions[subscriptionId];

      if (!filter || filter(subscription)) {
        subscription.cancel();
      }
    }
    
  }
  
  root.InMemorySubscriptions = InMemorySubscriptions;
  
})(exports ? require('./Subscriptions').Subscriptions : h5.pubsub.Subscriptions,
   exports ? exports : h5.pubsub);
