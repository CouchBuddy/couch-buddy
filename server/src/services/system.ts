import { networkInterfaces } from 'os'

function getIpAddresses (): string[] {
  const ifaces = networkInterfaces()
  const ips: string[] = []

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

      ips.push(iface.address)
    })
  })

  return ips
}

module.exports = {
  getIpAddresses
}
