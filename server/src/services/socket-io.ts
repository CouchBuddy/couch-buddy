import socketIo from 'socket.io'
import { singleton } from 'tsyringe'

import server from './server'
import Service from './Service'

@singleton()
export default class SocketIo extends Service {
  io: SocketIO.Server

  constructor () {
    super()
    this.io = socketIo()
  }

  async init (): Promise<void> {
    this.io.attach(server)

    this.io.on('connection', client => {
      client.on('event', () => { /* … */ })
      client.on('disconnect', () => { /* … */ })
    })
  }

  async destroy (): Promise<void> {
    this.io.close()
  }
}
