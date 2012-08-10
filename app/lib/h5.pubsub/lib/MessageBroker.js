(function(Sandbox, Subscription, InMemorySubscriptions, root) {
  
  var MessageBroker = function(options) {
    
    this._subscriptionId = 0;

    if (!options)
    {
      options = {};
    }

    this._onDestroy = [];

    this._subscriptions = options.subscriptionsFactory
                        ? options.subscriptionsFactory()
                        : MessageBroker.DEFAULTS.SUBSCRIPTIONS_FACTORY();

    this._newSubscription = options.subscriptionFactory
                          ? options.subscriptionFactory
                          : MessageBroker.DEFAULTS.SUBSCRIPTION_FACTORY;

    var self = this;

    this._gcInterval = setInterval(function() { self.gc(); },
                                   options.gcInterval
                                     ? options.gcInterval
                                     : MessageBroker.DEFAULTS.GC_INTERVAL);
    
  };

  MessageBroker.DEFAULTS = {

    GC_INTERVAL: 60000,

    SUBSCRIPTIONS_FACTORY: function() {
      
      return new InMemorySubscriptions();
      
    },

    SUBSCRIPTION_FACTORY: function(id, topic, callback) {
      
      return new Subscription(id, topic, callback);
      
    }

  };

  MessageBroker.TOPICS = {

    SUBSCRIBE: 'pubsub.subscribe',
    UNSUBSCRIBE: 'pubsub.unsubscribe'

  };

  MessageBroker.prototype = {

    sandbox: function() {
      
      var sandbox = new Sandbox(this);

      this.onDestroy(function() { sandbox.destroy(); });

      return sandbox;
      
    },

    publish: function(topic, message) {
      
      this._subscriptions.send(topic, message);
      
    },

    subscribe: function(topic, callback) {
      
      var self = this,
          subscription = this._newSubscription(this._subscriptionId++,
                                               topic,
                                               callback);

      this._subscriptions.add(subscription);

      subscription.onCancel(function() {
        
        self.publish(MessageBroker.TOPICS.UNSUBSCRIBE, {topic: topic});
        
      });

      this.publish(MessageBroker.TOPICS.SUBSCRIBE, {topic: topic});

      return subscription;
      
    },

    unsubscribe: function(topic, callback) {
      
      switch (arguments.length) {
        case 1:
          this._subscriptions.cancelByTopic(topic);
          break;

        case 2:
          this._subscriptions.cancelByCallback(topic, callback);
          break;

        default:
          this._subscriptions.cancelAll();
          break;
      }
      
    },

    gc: function() {
      
      this._subscriptions.gc();
      
    },

    destroy: function() {
      
      clearInterval(this._gcInterval);

      for (var i = 0, j = this._onDestroy.length; i < j; ++i) {
        this._onDestroy[i].call(this);
      }

      this._subscriptions.destroy();

      for (var property in this) delete this[property];
      
    },

    onDestroy: function(callback) {
      
      this._onDestroy.push(callback);
      
    }

  };

  root.MessageBroker = MessageBroker;
  
})(exports ? require('./Sandbox').Sandbox : h5.pubsub.Sandbox,
   exports ? require('./Subscription').Subscription : h5.pubsub.Subscription,
   exports ? require('./InMemorySubscriptions').InMemorySubscriptions : h5.pubsub.InMemorySubscriptions,
   exports ? exports : h5.pubsub);