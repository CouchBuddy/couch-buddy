import { hostname } from 'os'
// @ts-ignore
import mdns from 'mdns-js'

import config from '../config'
import Service from './Service'

const SERVICE_NAME = 'couchbuddy'

const getHostname = () => (
  hostname().split('.')[0]
)

export default class Discovery extends Service {
  service: any

  async init (): Promise<void> {
    this.service = mdns.createAdvertisement(mdns.tcp('_http'), config.port, {
      name: SERVICE_NAME,
      txt:{
        hostname: getHostname()
      }
    })

    this.service.start()
  }

  async destroy (): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.service.stop(() => {
          resolve()
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}
