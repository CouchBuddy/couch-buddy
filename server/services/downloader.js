const debounce = require('debounce')
const WebTorrent = require('webtorrent')

const config = require('../config')
const { Download } = require('../models')
const { addFileToLibrary } = require('./library')
const io = require('./socket-io')

const client = new WebTorrent()

// handle torrents completion
client.on('torrent', (torrent) => {
  torrent.on('done', onTorrentDone)
  torrent.on('download', debounce(onTorrentDownload))
})

restoreTorrents()

async function restoreTorrents () {
  const downloads = await Download.findAll({
    where: { done: false }
  })

  const opts = { path: config.mediaDir }

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
    addFileToLibrary(file.path)
  }
}

function onTorrentDownload () {
  io.emit('torrent:download', serializeTorrent(this))
}

function serializeTorrent (t) {
  return {
    infoHash: t.infoHash,
    name: t.name,
    timeRemaining: t.timeRemaining,
    progress: t.progress,
    downloadSpeed: t.downloadSpeed,
    uploadSpeed: t.uploadSpeed,
    length: t.length,
    downloaded: t.downloaded,
    paused: t.paused,
    done: t.done,
    numPeers: t.numPeers
  }
}

module.exports = {
  client,
  serializeTorrent
}
