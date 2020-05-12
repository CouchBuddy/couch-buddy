import socketIo from 'socket.io'

import server from './server'

const io = socketIo(server)

io.on('connection', client => {
  client.on('event', () => { /* … */ })
  client.on('disconnect', () => { /* … */ })
})

export default io
