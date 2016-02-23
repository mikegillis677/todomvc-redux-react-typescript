var path = require('path');
var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');
var config = require('./config');
var reactRouter = require('react-router');    // { match, RouterContext }
var history = require('history');   // { createLocation }
//var Html = require('../client/helpers/Html.tsx');
var ReactDOMServer = require('react-dom/server');

module.exports = function(options) {
  var Renderer = require("../config/SimpleRenderer.js");

  // load bundle information from stats
  var stats = options.devServer ? require("../build/stats-dev.json") : require("../build/stats.json");

  var publicPath = stats.publicPath;

  var renderer = new Renderer({
    styleUrl: options.separateStylesheet && (publicPath + "todos.css?" + stats.hash),
    scriptUrl: publicPath + [].concat(stats.assetsByChunkName.todos)[0]
  });

  var app = express();

  // serve the static assets
  app.use("/_assets", express.static(path.join(__dirname, "..", "build", "public"), {
    maxAge: "200d" // We can cache them as they include hashes
  }));
  app.use("/", express.static(path.join(__dirname, "..", "public"), {
  }));

  app.get("/*", function(req, res) {
    /*
    const location = createLocation(req.url);

    match({ routes, location }, (error, redirectLocation, renderProps: any) => {
      var html = ReactDOMServer.renderToString(<RouterContext {...renderProps} />)
      return res.render('main', { content: html, title: 'Home', min: min });
    });
    */
    renderer.render(
      req.path,
      function(err, html) {
        if(err) {
          res.statusCode = 500;
          res.contentType = "text; charset=utf8";
          res.end(err.message);
          return;
        }
        res.contentType = "text/html; charset=utf8";
        res.end(html);
      }
    );
  });

  //app.use(serveStatic(config.publicPath, {'index': ['index.html']}));

  var server = http.createServer(app);

  server.listen(config.port, function () {
    console.log('listening on http://localhost:' + config.port);
  });
};
