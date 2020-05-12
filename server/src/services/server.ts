import http from 'http'

import config from '../config'

const server = http.createServer()

server.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`)
})

export default server
