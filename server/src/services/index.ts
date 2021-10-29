import { container } from 'tsyringe'

import Discovery from './discovery'
import Downloader from './downloader'
import Extensions from './extensions'
import SocketIo from './socket-io'
import SSDP from './ssdp'
import Service from './Service'

const allServices: Service[] = [
  container.resolve(Discovery),
  container.resolve(Downloader),
  container.resolve(Extensions),
  container.resolve(SocketIo),
  container.resolve(SSDP)
]

export async function init () {
  for (const service of allServices) {
    await service.init()
  }
}

export async function destroy () {
  for (const service of allServices) {
    await service.destroy()
  }
}
