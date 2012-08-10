(function(root) {
  
  var Subscriptions = function() {

    

  };

  Subscriptions.TOKEN = {
    
    SEPARATOR: '.',
    ALL: '**',
    ANY: '*'
    
  };

  Subscriptions.prototype = {

    send: function(topic, message) {
      
      throw new Error('Not implemented.');
      
    },

    add: function(subscription) {
      
      throw new Error('Not implemented.');
      
    },

    cancelByTopic: function(topic) {
      
      throw new Error('Not implemented.');
      
    },

    cancelByCallback: function(topic, callback) {
      
      throw new Error('Not implemented.');
      
    },

    cancelAll: function() {
      
      throw new Error('Not implemented.');
      
    },

    gc: function() {
      
      throw new Error('Not implemented.');
      
    },

    destroy: function() {
      
      throw new Error('Not implemented.');
      
    }

  };

  root.Subscriptions = Subscriptions;
  
})(exports ? exports : h5.pubsub);
