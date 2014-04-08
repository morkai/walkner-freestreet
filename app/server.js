// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

console.log('--------------------------------------------------------------------------------');
console.log("Tester - Walkner @ %s", new Date().toUTCString());
console.log('--------------------------------------------------------------------------------');

process.on('uncaughtException', function(err) { console.error(err.stack); });

require('./boot')(require('express').createServer());
