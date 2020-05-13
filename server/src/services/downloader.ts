import debounce from 'debounce'
import { Namespace, Server } from 'socket.io'
import { inject, singleton } from 'tsyringe'
import WebTorrent, { Torrent } from 'webtorrent'

import config from '../config'
import Download from '../models/Download'
import { addFileToLibrary, parseFileName } from './library'
import Service from './Service'
import SocketIoService from './socket-io'

export function serializeTorrent (t: Torrent) {
  return {
    infoHash: t.infoHash,
    name: t.name,
    info: parseFileName(t.name),
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

@singleton()
export default class Downloader extends Service {
  client: WebTorrent.Instance;
  downloadsNs: Namespace;
  socketIo: SocketIoService;

  constructor (@inject(SocketIoService) socketIoService: SocketIoService) {
    super()
    this.downloadsNs = socketIoService.io.of('/downloads')
  }

  async init () {
    this.client = new WebTorrent()

    const downloads = await Download.find({
      where: { done: false }
    })

    const opts = { path: config.mediaDir }

    for (const download of downloads) {
      this.client.add(download.magnetURI, opts)
    }

    // handle torrents completion
    this.client.on('torrent', (torrent: Torrent) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this

      torrent.on('done', function () {
        that.onTorrentDone(this)
      })
      torrent.on('download', debounce(function () {
        that.onTorrentDownload(this)
      }))
    })

    this.downloadsNs.on('connection', (socket) => {
      socket.emit('torrent:all', this.client.torrents.map(serializeTorrent))
    })
  }

  destroy (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.destroy((err) => {
        if (err) { return reject(err) }
        resolve()
      })
    })
  }

  onTorrentDownload (torrent: Torrent) {
    this.downloadsNs.emit('torrent:download', serializeTorrent(torrent))
  }

  async onTorrentDone (torrent: Torrent) {
    // this = torrent
    await Download.update({ done: true }, {
      infoHash: torrent.infoHash
    })

    for (const file of torrent.files) {
      addFileToLibrary(file.path)
    }
  }
}
