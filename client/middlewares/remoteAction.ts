import { Middleware } from 'redux';
import * as io from 'socket.io-client';

var remoteAction:(socket:any) => Middleware = socket => store => next => action => {
  console.log("in middleware", action);
  if(!action.remote) {
    socket.emit("action", action);
  }
  return next(action);
}


export = remoteAction;
