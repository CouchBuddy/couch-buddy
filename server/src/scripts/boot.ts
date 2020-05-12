import cliProgress from 'cli-progress'
import dotenv from 'dotenv'

import { init } from '../models'

export default async function boot () {
  dotenv.config()
  await init()

  return new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
}

/**
 * Create a script like this:
if (require.main === module) {
  (async function () {
    await main(await require('./boot'))
    process.exit(0)
  })()
}
 */
