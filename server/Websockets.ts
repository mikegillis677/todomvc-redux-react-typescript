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
      () => this.server.emit('state', JSON.stringify(store.getState()) )
    );
  }

  setupOnConnection() {
    const store = this.store;
    const server = this.server;
    server.on('connection', (socket: SocketIO.Socket) => {
      console.log('Connected client: ' + socket.id);

      socket.emit('state', () => {
        console.log('Emitting');
        return JSON.stringify(store.getState());
      });
      socket.on('action', (action) => {
        console.log('Action received', action);
        action.creator = socket.id;
        server.emit('client-action', action);
      });
    });
  }
}
