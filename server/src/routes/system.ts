import { Context } from 'koa'

import packageJson from '../../package.json'
import { getIpAddresses } from '../services/system'

export async function getSystemInfo (ctx: Context) {
  ctx.body = {
    ipAddresses: getIpAddresses(),
    version: packageJson.version
  }
}
