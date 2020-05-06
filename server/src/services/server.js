const server = require('http').createServer()

const config = require('../config')

server.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`)
})

module.exports = server
