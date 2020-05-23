import debounce from 'debounce'
import { promises as fs } from 'fs'
import path from 'path'
import { Namespace } from 'socket.io'
import { inject, singleton } from 'tsyringe'
import WebTorrent, { Torrent, TorrentOptions } from 'webtorrent'

import config from '../config'
import Download from '../models/Download'
import { addFileToLibrary, parseFileName, scanDirectory } from './library'
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

    for (const download of downloads) {
      this.addTorrent(download.magnetURI)
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

  /**
   * Add a torrent to the download client. If the media directory is not
   * available, it throws an error.
   *
   * @param torrentId A Magnet URI or a path to a torrent file
   */
  async addTorrent (torrentId: string): Promise<Torrent> {
    const stats = await fs.stat(config.mediaDir)

    if (!stats.isDirectory()) {
      throw new Error('Media directory is not available')
    }

    const opts: TorrentOptions = { path: config.mediaDir }

    return await new Promise<Torrent>((resolve) => {
      this.client.add(torrentId, opts, (torrent) => {
        resolve(torrent)
      })
    })
  }

  onTorrentDownload (torrent: Torrent) {
    this.downloadsNs.emit('torrent:download', serializeTorrent(torrent))
  }

  async onTorrentDone (torrent: Torrent) {
    if (torrent.files.length === 1) {
      await addFileToLibrary(torrent.files[0].path)
    } else {
      /**
       * If the torrent contains more files, they are organized into a folder,
       * so the entire folder must be scanned and added to the library.
       * The `files` prop is an array of relative paths, i.e.:
       * `[ 'dir/file.mp4', 'dir/subs.srt' ]`
       */
      const torrentDir = torrent.files[0].path.split(path.sep)[0]
      await scanDirectory(path.join(config.mediaDir, torrentDir))
    }

    const download = await Download.findOne({ infoHash: torrent.infoHash })
    download.done = true
    await download.save()
  }
}
