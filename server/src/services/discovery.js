const mdns = require('multicast-dns')({ loopback: false })
const hostname = require('os').hostname()

const config = require('../config')
const { getIpAddresses } = require('./system')

const COUCHBUDDY_HOSTNAME = '_couchbuddy._tcp.local'

mdns.on('query', function (query) {
  for (const question of query.questions) {
    if (!question.name.endsWith(COUCHBUDDY_HOSTNAME)) { continue }

    if (question.type === 'PTR') {
      mdns.respond([{
        name: COUCHBUDDY_HOSTNAME,
        type: 'PTR',
        data: `${hostname}.${COUCHBUDDY_HOSTNAME}`
      }])
    } else if (question.type === 'SRV') {
      mdns.respond([{
        name: `${hostname}.${COUCHBUDDY_HOSTNAME}`,
        type: 'SRV',
        data: {
          port: config.port,
          weight: 0,
          priority: 10,
          target: `${hostname}.${COUCHBUDDY_HOSTNAME}`
        }
      }])
    } else if (question.type === 'A') {
      mdns.respond([{
        name: `${hostname}.${COUCHBUDDY_HOSTNAME}`,
        type: 'A',
        data: getIpAddresses()[0]
      }])
    }
  }
})
