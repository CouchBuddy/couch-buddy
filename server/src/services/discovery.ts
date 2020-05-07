import { Packet } from 'dns-packet'
import MulticastDns from 'multicast-dns'
import { hostname } from 'os'

const config = require('../config')
const { getIpAddresses } = require('./system')

const COUCHBUDDY_HOSTNAME = '_couchbuddy._tcp.local'

const mdns = MulticastDns({ loopback: false })

mdns.on('query', function (query: Packet) {
  for (const question of query.questions) {
    if (!question.name.endsWith(COUCHBUDDY_HOSTNAME)) { continue }

    let responsePacket: Packet = {
      type: 'response',
      answers: []
    }

    if (question.type === 'PTR') {
       responsePacket.answers.push({
        name: COUCHBUDDY_HOSTNAME,
        type: 'PTR',
        data: `${hostname()}.${COUCHBUDDY_HOSTNAME}`
      })
    } else if (question.type === 'SRV') {
      responsePacket.answers.push({
        name: `${hostname()}.${COUCHBUDDY_HOSTNAME}`,
        type: 'SRV',
        data: {
          port: config.port,
          weight: 0,
          priority: 10,
          target: `${hostname()}.${COUCHBUDDY_HOSTNAME}`
        }
      })
    } else if (question.type === 'A') {
      responsePacket.answers.push({
        name: `${hostname()}.${COUCHBUDDY_HOSTNAME}`,
        type: 'A',
        data: getIpAddresses()[0]
      })
    } else {
      responsePacket = null
    }

    if (responsePacket) {
      mdns.respond(responsePacket)
    }
  }
})
