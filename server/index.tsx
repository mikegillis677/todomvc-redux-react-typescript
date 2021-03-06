/// <reference path='../typings/main.d.ts'/>

import * as path from 'path';
import * as express from 'express';
import * as http from 'http';
import * as serveStatic from 'serve-static';
import * as fs from 'fs';
import { config, ServerConfig } from './config';
import { match, RouterContext } from 'react-router';
import history = require('history');
import Html from '../client/helpers/Html';
import * as ReactDOMServer from 'react-dom/server';
import Websockets from './Websockets';

import * as React from 'react';
import {
  Store,
  createStore
} from 'redux';
import {Provider} from 'react-redux';
import { rootReducer } from '../client/reducers/rootReducer';
import routes from '../client/routes';

interface BuildStatsAssetsByChunkName {
  todos: string[]
}
interface BuildStats {
  hash: string,
  publicPath: string,
  assetsByChunkName: BuildStatsAssetsByChunkName
}

function runServer(options) {
  // load bundle information from stats
  var statsFilename = options.devServer ? "../stats-dev.json" : "../stats.json";
  statsFilename = path.join(__dirname, statsFilename);
  var stats: BuildStats = JSON.parse(fs.readFileSync(statsFilename, 'utf8'));

  const store: Store = createStore(rootReducer, {});

  var app = express();

  // serve the static assets
  app.use("/_assets", express.static(path.join(__dirname, "..", "public"), {
    maxAge: "200d" // We can cache them as they include hashes
  }));
  app.use("/", express.static(path.join(__dirname, "..", "public"), {
  }));

  app.get("/*", function(req, res) {

    const historyObj = history.createMemoryHistory();
    const location = historyObj.createLocation(req.url);
    match({ routes, location }, (error, redirectLocation, renderProps: any) => {
      const publicPath = stats.publicPath;
      const scriptUrl: string = publicPath + [].concat(stats.assetsByChunkName.todos)[0];
      const styleUrl: string = options.separateStylesheet && (publicPath + "todos.css?" + stats.hash);
      const component = (
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>
      );

      res.send('<!doctype html>\n' +
        ReactDOMServer.renderToString(<Html scriptUrl={scriptUrl} styleUrl={styleUrl} component={component} store={store}/>));
    });
  });

  var server = http.createServer(app);
  var websockets = new Websockets(server, store);

  server.listen(config.port, function () {
    console.log('listening on http://localhost:' + config.port);
  });
};

export = runServer;
