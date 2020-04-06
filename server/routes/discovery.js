const dgram = require('dgram')

const MULTICAST_ADDRESS = '224.0.0.234'
const server = dgram.createSocket({ type: 'udp4', reuseAddr: true })

server.on('error', (err) => {
  console.error('Error starting UDP socket', err)
  server.close()
})

server.on('message', (msg, rinfo) => {
  const response = Buffer.from('CouchBuddy v1')

  server.send(response, 0, response.length, rinfo.port, rinfo.address, (err) => {
    if (err) console.error(err)
  })
})

server.on('listening', () => {
  server.addMembership(MULTICAST_ADDRESS)
  server.setBroadcast(true)
})

server.bind(41234, MULTICAST_ADDRESS)
