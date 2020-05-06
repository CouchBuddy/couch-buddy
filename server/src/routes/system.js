const checkDiskSpace = require('check-disk-space')
const fs = require('fs')
const fsPromises = fs.promises

const config = require('../config')
const { version } = require('../../package.json')
const { getIpAddresses } = require('../services/system')

async function getSystemInfo (ctx) {
  let mediaDirAvailable = false

  try {
    await fsPromises.access(config.mediaDir, fs.constants.R_OK | fs.constants.W_OK)
    mediaDirAvailable = true
  } catch (e) {}

  ctx.body = {
    diskSpace: await checkDiskSpace(config.mediaDir),
    ipAddresses: getIpAddresses(),
    mediaDirAvailable,
    mediaDirPath: config.mediaDir,
    version
  }
}

module.exports = {
  getSystemInfo
}
