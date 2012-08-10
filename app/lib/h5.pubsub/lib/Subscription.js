(function(filters, root) {
  
  var Subscription = function(id, topic, callback) {
    
    this.id = id;
    this.topic = topic;
    this.callback = callback;
    this.cancelled = false;
    
    this._onCancel = [];
    this._filter  = function() { return true; };
    this._messageLimit = 0;
    this._messageCount = 0;
    
  };

  Subscription.prototype = {

    send: function(topic, message) {
      
      if (this.cancelled || !this._filter(message)) {
        return;
      }

      this.callback(message, topic);

      if (this._messageLimit && ++this._messageCount >= this._messageLimit) {
        this.cancel();
      }
      
    },

    once: function() {
      
      return this.limit(1);
      
    },

    limit: function(messageLimit) {
      
      this._messageLimit = messageLimit;

      return this;
      
    },

    filter: function(filter) {
      
      this._filter = filters.create(filter);

      return this;
      
    },

    onCancel: function(callback) {
      
      this._onCancel.push(callback);

      return this;
      
    },

    cancel: function() {
      
      if (this.cancelled) {
        return;
      }

      for (var i = 0, z = this._onCancel.length; i < z; ++i) {
        this._onCancel[i].call(this);
      }

      for (var property in this) delete this[property];

      this.cancelled = true;
      
    }

  };

  root.Subscription = Subscription;
  
})(exports ? require('./filters').filters : h5.pubsub.filters,
   exports ? exports : h5.pubsub);