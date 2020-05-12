import socketIo from 'socket.io'

import config from '../config'

const io = socketIo(config.wsPort)

io.on('connection', client => {
  client.on('event', () => { /* … */ })
  client.on('disconnect', () => { /* … */ })
})

export default io
