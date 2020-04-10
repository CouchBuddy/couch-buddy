const checkDiskSpace = require('check-disk-space')
const fs = require('fs')
const fsPromises = fs.promises

const config = require('../config')
const { version } = require('../package.json')

async function getSystemInfo (ctx) {
  let mediaDirAvailable = false

  try {
    await fsPromises.access(config.mediaDir, fs.constants.R_OK | fs.constants.W_OK)
    mediaDirAvailable = true
  } catch (e) {}

  ctx.body = {
    diskSpace: await checkDiskSpace(config.mediaDir),
    ipAddresses: getIPs(),
    mediaDirAvailable,
    mediaDirPath: config.mediaDir,
    version
  }
}

function getIPs () {
  const os = require('os')
  const ifaces = os.networkInterfaces()
  const ips = []

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
  getSystemInfo
}
