import cliProgress from 'cli-progress'

import '../config'
import { init } from '../models'

export default async function boot () {
  await init()

  return new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
}

/**
 * Create a script like this:
 *
import boot from './boot'

async function main (bar: any) {

}

if (require.main === module) {
  (async function () {
    await main(await boot())
    process.exit(0)
  })()
}
 */
