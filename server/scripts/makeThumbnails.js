const { Episode, MediaFile } = require('../models')
const { takeScreenshot } = require('../routes/library')

async function main ({ bar }) {
  const episodes = await Episode.findAll()
  bar.start(episodes.length, 0)

  for (const episode of episodes) {
    const media = await MediaFile.findOne({ where: { mediaType: 'episode', mediaId: episode.id } })
    episode.thumbnail = await takeScreenshot(process.env.MEDIA_BASE_DIR + media.fileName)
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
