// Import all services that require initialization
import './discovery'
import { init as initDownloader } from './downloader'
import { init as initExt } from './extensions'
import './socket-io'

export async function init () {
  await initDownloader()
  await initExt()
}
