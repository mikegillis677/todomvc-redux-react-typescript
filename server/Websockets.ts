import * as SocketIO from 'socket.io';
import { Store } from 'redux';
import * as http from 'http';

export default class Websockets {
  // TODO: Figure out the right type for this
  server: any;
  store: Store;
  httpServer: http.Server;

  constructor(httpServer: http.Server, store: Store) {
    this.makeServer(httpServer);
    this.bindStore(store);
    this.setupOnConnection();
  }

  makeServer(httpServer: http.Server) {
    this.server = SocketIO();
    this.server.serveClient = true;
    this.server.attach(httpServer);
  }

  on(event: string, listener: ( socket: SocketIO.Socket ) => void) {
    this.server.on(event, listener);
  }

  bindStore(store: Store) {
    this.store = store;
    store.subscribe(
      () => this.server.emit('state', store.getState().toJS())
    );
  }

  setupOnConnection() {
    const store = this.store;
    this.server.on('connection', (socket) => {
      socket.emit('state', store.getState().toJS());
      socket.on('action', store.dispatch.bind(store));
    });
  }
}
