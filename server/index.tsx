/// <reference path='../typings/tsd.d.ts'/>

import * as path from 'path';
import * as express from 'express';
import * as http from 'http';
import * as serveStatic from 'serve-static';
import * as fs from 'fs';
import { config, ServerConfig } from './config';
import { match, RouterContext } from 'react-router';    // { match, RouterContext }
import { createLocation } from 'history';   // { createLocation }
import Html from '../client/helpers/Html';
import * as ReactDOMServer from 'react-dom/server';
import { Renderer } from "../config/SimpleRenderer";

interface BuildStatsAssetsByChunkName {
  todos: string[]
}
interface BuildStats {
  hash: string,
  publicPath: string,
  assetsByChunkName: BuildStatsAssetsByChunkName
}

export default function runServer(options) {
  // load bundle information from stats
  var statsFilename = options.devServer ? "../build/stats-dev.json" : "../build/stats.json";
  statsFilename = path.join(__dirname, statsFilename);
  var stats: BuildStats = JSON.parse(fs.readFileSync(statsFilename, 'utf8'));

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
          res.contentType("html");
          res.end(err.message);
          return;
        }
        res.contentType("html");
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
