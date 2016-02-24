import * as React from 'react';
import { renderToString } from 'react-dom/server';
import serialize = require('serialize-javascript');

import {
  Store,
  compose,
  createStore,
  bindActionCreators,
  combineReducers
} from 'redux';
import {
  connect,
  Provider
} from 'react-redux';
import { Action } from 'redux-actions';

interface AssetJavascript {
  main: string;
}
interface Assets {
  styles: Object[];
  javascript: AssetJavascript;
}
interface HtmlProps {
  component: React.ReactElement<any>;
  store: Store;
  scriptUrl: string;
  styleUrl: string;
}

export default class Html extends React.Component<HtmlProps, void> {
  render() {
    const {
      component,
      store,
      scriptUrl,
      styleUrl
    } = this.props;

    const content = component ? renderToString(component) : '';

    return (
      <html lang="en-us">
        <head>
          <title>TodoMVC</title>
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href={styleUrl} media="screen, projection"
                rel="stylesheet" type="text/css" charSet="UTF-8"/>
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{__html: content}}/>
          <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} charSet="UTF-8"/>
          <script src={scriptUrl} charSet="UTF-8"/>
        </body>
      </html>
    );
  }
}
