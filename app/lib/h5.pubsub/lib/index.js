var classNames = [
  'MessageBroker',
  'Sandbox',
  'Subscription',
  'Subscriptions',
  'InMemorySubscriptions',
  'filters'
].forEach(function(className) {

  exports[className] = require('./' + className)[className];

});