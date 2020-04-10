const WebSocket = require('ws')

const config = require('../config')

const wss = new WebSocket.Server({ port: config.wsPort })

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message)
  })
})

module.exports = {
  wss
}
