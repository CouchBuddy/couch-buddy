import { SingleBar } from 'cli-progress'

import boot from './boot'
import Discovery from '../services/discovery-drives'
import { addFileToLibrary } from '../services/library'

async function main (bar: SingleBar) {
  const discovery = new Discovery()

  // await discovery.init()
  // discovery.scan()

  const videos = await discovery.parseDevice(process.argv[2])

  if (!videos || !videos.length) { return }

  bar.start(videos.length, 0)

  for (const video of videos) {
    if (!await addFileToLibrary(video.url, video.title, video.mimeType)) {
      console.warn('Video not added to the lib', video)
    }

    bar.increment()
  }
}

if (require.main === module) {
  (async function () {
    await main(await boot())
    process.exit(0)
  })()
}
