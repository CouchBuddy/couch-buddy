import { Packet } from 'dns-packet'
import Mdns, { MulticastDns } from 'multicast-dns'
import { hostname } from 'os'

import config from '../config'
import { getIpAddresses } from './system'
import Service from './Service'

const COUCHBUDDY_HOSTNAME = '_couchbuddy._tcp.local'

export default class Discovery extends Service {
  mdns: MulticastDns;

  async init (): Promise<void> {
    this.mdns = Mdns({ loopback: false })

    this.mdns.on('query', (query) => this.queryHandler(query))
  }

  async destroy (): Promise<void> {
    return new Promise((resolve, reject) =>
      this.mdns.destroy((err) => {
        if (err) { return reject(err) }
        resolve()
      })
    )
  }

  queryHandler (query: Packet) {
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
        this.mdns.respond(responsePacket)
      }
    }
  }
}
