import debounce from 'debounce'
import WebTorrent, { Torrent } from 'webtorrent'

import config from '../config'
const { Download } = require('../models')
const { addFileToLibrary, parseTorrentTitle } = require('./library')
import io from './socket-io'

io.of('/downloads')

const client = new WebTorrent()

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

function serializeTorrent (t: Torrent) {
  return {
    infoHash: t.infoHash,
    name: t.name,
    info: parseTorrentTitle(t.name),
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

function onTorrentDownload () {
  io.emit('torrent:download', serializeTorrent(this))
}

// handle torrents completion
client.on('torrent', (torrent: Torrent) => {
  torrent.on('done', onTorrentDone)
  torrent.on('download', debounce(onTorrentDownload))
})

io.on('connection', (socket) => {
  socket.emit('torrent:all', client.torrents.map(serializeTorrent))
})

restoreTorrents()

module.exports = {
  client,
  serializeTorrent
}
