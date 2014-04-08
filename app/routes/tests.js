// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-freestreet project <http://lukasz.walukiewicz.eu/p/walkner-freestreet>

module.exports = function(app)
{
  app.post('/tests/purge', function(req, res)
  {
    var days = parseFloat(req.param('days'));

    if (isNaN(days))
    {
      return res.send(400);
    }

    app.tests.purge(days, function(err)
    {
      if (err) return res.send(400);

      return res.send(200);
    });
  });
};
