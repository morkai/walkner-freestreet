(function(root) {
  
  function create(filter) {
    
    if (filter instanceof Function) {
      return filter;
    }

    if (filter instanceof Object) {
      return createComposite(filter);
    }

    return createIdentical(filter);
    
  }
  
  function createComposite(rules) {
    
    for (var property in rules) {
      rules[property] = create(rules[property]);
    }

    return function(message) {
      
      if (!(message instanceof Object)) {
        return false;
      }

      for (var property in rules) {
        if (!(property in message) || !rules[property](message[property])) {
          return false;
        }
      }

      return true;
      
    };
    
  }

  function createIdentical(value) {
    
    return function(message) { return message === value; };
    
  }
  
  root.filters = {
    
    create: create
    
  };

})(exports ? exports : h5.pubsub);