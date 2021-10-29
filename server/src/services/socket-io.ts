import SocketIO from 'socket.io'
import { singleton } from 'tsyringe'

import server from './server'
import Service from './Service'

@singleton()
export default class SocketIo extends Service {
  io: SocketIO.Server

  constructor () {
    super()
    this.io = new SocketIO.Server({
      serveClient: false,
      transports: [ 'websocket' ]
    })
  }

  async init (): Promise<void> {
    this.io.attach(server)
  }

  async destroy (): Promise<void> {
    this.io.close()
  }
}
