import checkDiskSpace from 'check-disk-space'
import { Context } from 'koa'
import fs from 'fs'

import config from '../config'
import packageJson from '../../package.json'
import { getIpAddresses } from '../services/system'

export async function getSystemInfo (ctx: Context) {
  let mediaDirAvailable = false

  try {
    await fs.promises.access(config.mediaDir, fs.constants.R_OK | fs.constants.W_OK)
    mediaDirAvailable = true
  } catch (e) {}

  ctx.body = {
    diskSpace: await checkDiskSpace(config.mediaDir),
    ipAddresses: getIpAddresses(),
    mediaDirAvailable,
    mediaDirPath: config.mediaDir,
    version: packageJson.version
  }
}
