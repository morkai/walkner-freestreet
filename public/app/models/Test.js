// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

Test = Backbone.Model.extend({
  initialize: function()
  {
    
  },
  readable: function()
  {
    var startTime = new Date(parseInt(this.get('startTime'), 10));
    var endTime = new Date(parseInt(this.get('endTime'), 10));
    var elapsedTime = Math.round((this.get('endTime') - this.get('startTime')) / 1000);
    var elapsedMins = Math.floor(elapsedTime / 60);
    var elapsedSecs = elapsedTime % 60;
    var elapsedTime = '';
    
    if (elapsedMins > 0)
    {
      elapsedTime += elapsedMins + ' minut ';
    }

    if (elapsedSecs > 0)
    {
      elapsedTime += '~' + elapsedSecs + ' sekund';
    }
    
    return {
      tester: this.get('tester'),
      program: this.get('program'),
      status: Test.STATUSES[this.get('status')],
      startTime: startTime.toLocaleDateString() + ' ' + startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleDateString() + ' ' + endTime.toLocaleTimeString(),
      elapsedTime: elapsedTime
    };
  }
});

Test.STATUSES = {
  unknown:  'Nieokreślony',
  stopped:  'Zatrzymany',
  shutdown: 'Wyłączony',
  finished: 'Zakończony'
};
