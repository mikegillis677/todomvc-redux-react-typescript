/// <reference path='../typings/main.d.ts'/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  Store,
  compose,
  createStore,
  bindActionCreators,
  combineReducers,
  applyMiddleware
} from 'redux';
import {
  connect,
  Provider
} from 'react-redux';
import { Action } from 'redux-actions';
import { Router, browserHistory } from 'react-router';
import routes from './routes';

import App from './containers/App';
import { rootReducer } from './reducers/rootReducer';
import * as TodoActions from './actions/todos';
import * as io from 'socket.io-client';
import * as remoteActionMiddleware from './middlewares/remoteAction';

const initialState = {};

const socket = io(`${location.protocol}//${location.hostname}:8000`);
const createStoreWithMiddleware = applyMiddleware(
  remoteActionMiddleware(socket)
)(createStore);
const store: Store = createStoreWithMiddleware(rootReducer, initialState);

socket.on('state', state => {
  for(var todo of state) {
    TodoActions.setTodo(todo);
  }
});

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>{routes}</Router>
  </Provider>,
  document.getElementById('app')
);
