const path = require('path')
const WebTorrent = require('webtorrent')

const { Download } = require('./models')
const { addFileToLibrary } = require('./routes/library')

const client = new WebTorrent()

// handle torrents completion
client.on('torrent', (torrent) => {
  torrent.on('done', onTorrentDone)
})

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

async function onTorrentDone () {
  // this = torrent
  await Download.update({ done: true }, {
    where: { infoHash: this.infoHash }
  })

  for (const file of this.files) {
    addFileToLibrary(path.relative(process.env.MEDIA_BASE_DIR, file.path))
  }
}

module.exports = client
