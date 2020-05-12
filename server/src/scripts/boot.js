/**
 * Create a script like this:
if (require.main === module) {
  (async function () {
    await main(await require('./boot'))
    process.exit(0)
  })()
}
 */

const cliProgress = require('cli-progress')
const path = require('path')

// load env vars from .env file
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})

// Initialize DB
require('../src/models').init()

module.exports = {
  bar: new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
}
