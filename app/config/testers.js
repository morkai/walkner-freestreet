// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

exports.defaultModel = 'MOD_RSsim';

exports.models = {
  
  MOD_RSsim: {
    name:                  'Symulator MOD_RSsim',
    timeout:               50,
    maxTimeouts:           5,
    maxRetries:            3,
    maxConcurrentRequests: 1,
    pwmMaxValue:           4000,
    pwmOffValue:           0,
    pwmAddress:            0x0001,
    inputsAddress:         0x0000,
    outputsAddress:        0x0000,
    beeperAddress:         0x0004,
    ledsAddress:           0x0000,
    keepAliveAddress:      0x0005
  },
  
  DVP_SX2: {
    name:                  'Sterownik DVP-SX2',
    timeout:               50,
    maxTimeouts:           10,
    maxRetries:            3,
    maxConcurrentRequests: 1,
    pwmMaxValue:           1840,
    pwmOffValue:           2000,
    pwmAddress:            0x1000 + 1116,
    inputsAddress:         0x0400,
    outputsAddress:        0x0500,
    beeperAddress:         0x0500 + 5,
    ledsAddress:           0x0800 + 200,
    keepAliveAddress:      0x0800 + 10
  }
  
};
