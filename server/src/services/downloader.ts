import debounce from 'debounce'
import WebTorrent, { Torrent } from 'webtorrent'

import config from '../config'
import Download from '../models/Download'
const { addFileToLibrary, parseTorrentTitle } = require('./library')
import ioServer from './socket-io'

const downloadsNs = ioServer.of('/downloads')

export const client = new WebTorrent()

async function restoreTorrents () {
  const downloads = await Download.find({
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
    infoHash: this.infoHash
  })

  for (const file of this.files) {
    addFileToLibrary(file.path)
  }
}

export function serializeTorrent (t: Torrent) {
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
  downloadsNs.emit('torrent:download', serializeTorrent(this))
}

// handle torrents completion
client.on('torrent', (torrent: Torrent) => {
  torrent.on('done', onTorrentDone)
  torrent.on('download', debounce(onTorrentDownload))
})

downloadsNs.on('connection', (socket) => {
  socket.emit('torrent:all', client.torrents.map(serializeTorrent))
})

restoreTorrents()
