const socketIo = require('socket.io')
const config = require('../config')

const io = socketIo(config.wsPort)

io.on('connection', client => {
  client.on('event', data => { /* … */ })
  client.on('disconnect', () => { /* … */ })
})

module.exports = io
