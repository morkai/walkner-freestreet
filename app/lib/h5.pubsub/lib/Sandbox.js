(function(root) {
  
  var Sandbox = function(messageBroker) {
    
    this._messageBroker = messageBroker;
    this._subscriptions = {};
    this._onDestroy = [];
    
  };

  Sandbox.prototype = {

    sandbox: function() {
      
      var sandbox = new Sandbox(this);

      this.onDestroy(function() { sandbox.destroy(); });

      return sandbox;
      
    },

    publish: function(topic, message) {
      
      this._messageBroker.publish(topic, message);
      
    },

    subscribe: function(topic, callback) {
      
      var self = this,
          subscription = this._messageBroker.subscribe(topic, callback);

      subscription.onCancel(function() {
        
        delete self._subscriptions[this.id];
        
      });

      return this._subscriptions[subscription.id] = subscription;
      
    },

    unsubscribe: function(topic, callback) {
      
      var filter;

      switch (arguments.length) {
        case 1:
          filter = function(topic) { return this.topic === topic; };
          break;

        case 2:
          filter = function(topic, callback) {
            
            return this.topic === topic && this.callback === callback;
            
          };
          break;

        default:
          filter = function() { return true; };
      }

      for (var id in this._subscriptions) {
        var subscription = this._subscriptions[id];

        if (filter.call(subscription, topic, callback)) {
          subscription.cancel();
        }
      }
      
    },

    gc: function() {
      
      this._messageBroker.gc();
      
    },

    destroy: function() {
      
      this.unsubscribe();

      for (var i = 0, j = this._onDestroy.length; i < j; ++i) {
        this._onDestroy[i].call(this);
      }

      for (var property in this) delete this[property];
      
    },

    onDestroy: function(callback) {
      
      this._onDestroy.push(callback);
      
    }
    
  };

  root.Sandbox = Sandbox;
  
})(exports ? exports : h5.pubsub);