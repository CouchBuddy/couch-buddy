import { networkInterfaces } from 'os'

let ipAddressesCache: string[] = []

export function getIpAddresses (): string[] {
  if (ipAddressesCache.length) {
    return ipAddressesCache
  }

  const ifaces = networkInterfaces()

  Object.keys(ifaces).forEach(function (ifname) {
    let alias = 0

    ifaces[ifname].forEach(function (iface) {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
      } else {
        // this interface has only one ipv4 adress
      }
      ++alias

      ipAddressesCache.push(iface.address)
    })
  })

  return ipAddressesCache
}
