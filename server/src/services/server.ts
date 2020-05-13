import http from 'http'

import config from '../config'

const server = http.createServer()

export function init (): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(config.port, () => {
      console.log(`Server listening on http://localhost:${config.port}`)
      server.off('error', reject)

      resolve()
    })

    server.on('error', reject)
  })
}

export default server
