const config = require('../config')
const { Episode, MediaFile } = require('../models')
const { takeScreenshot } = require('../services/library')

async function main ({ bar }) {
  const episodes = await Episode.findAll()
  bar.start(episodes.length, 0)

  for (const episode of episodes) {
    const media = await MediaFile.findOne({ where: { mediaType: 'episode', mediaId: episode.id } })
    episode.thumbnail = await takeScreenshot(config.mediaDir + media.fileName)
    await episode.save()
    bar.increment()
  }
}

if (require.main === module) {
  (async function () {
    await main(await require('./boot'))
    process.exit(0)
  })()
}
