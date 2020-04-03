const WebTorrent = require('webtorrent')

const { Download } = require('./models')

const client = new WebTorrent()
restoreTorrents()

async function restoreTorrents () {
  const downloads = await Download.findAll({
    where: { done: false }
  })

  const opts = { path: process.env.MEDIA_BASE_DIR }

  for (const download of downloads) {
    client.add(download.magnetURI, opts)
  }
}

module.exports = client
