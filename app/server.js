console.log('--------------------------------------------------------------------------------');
console.log("Tester - Walkner @ %s", new Date().toUTCString());
console.log('--------------------------------------------------------------------------------');

process.on('uncaughtException', function(err) { console.error(err.stack); });

require('./boot')(require('express').createServer());