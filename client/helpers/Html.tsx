/// <reference path='../../typings/tsd.d.ts'/>

import * as React from 'react';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';

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
  assets: Assets;
  component: React.ReactElement<any>;
  store: Store;
}

export default class Html extends React.Component<HtmlProps, void> {
  render() {
    const {
      assets,
      component,
      store
    } = this.props;

    const content = component ? renderToString(component) : '';

    return (
      <html lang="en-us">
        <head>
          <title>TodoMVC</title>
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* styles (will be present only in production with webpack extract text plugin) */}
          {Object.keys(assets.styles).map((style, key) =>
            <link href={assets.styles[style]} key={key} media="screen, projection"
                  rel="stylesheet" type="text/css" charSet="UTF-8"/>
          )}
        </head>
        <body>
          <div id="content" dangerouslySetInnerHTML={{__html: content}}/>
          <script dangerouslySetInnerHTML={{__html: `window.__data=${serialize(store.getState())};`}} charSet="UTF-8"/>
          <script src={assets.javascript.main} charSet="UTF-8"/>
        </body>
      </html>
    );
  }
}
