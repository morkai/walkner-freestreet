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
