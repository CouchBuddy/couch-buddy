import { Context } from 'koa'
import { container } from 'tsyringe'

import Downloader, { serializeTorrent } from '../services/downloader'
import Download from '../models/Download'

const downloader = container.resolve(Downloader)

export async function addTorrent (ctx: Context) {
  const magnetURI: string = ctx.request.body.magnetURI
  const torrentFile = ctx.request.files ? ctx.request.files.torrents : null

  ctx.assert(magnetURI || torrentFile, 400, 'You must provide the magnetURI field or upload a file')

  // Torrent file has priority over magnetURI if both are present
  let torrentId: string

  if (torrentFile) {
    torrentId = torrentFile.path
  } else {
    torrentId = magnetURI
  }

  try {
    const torrent = await downloader.addTorrent(torrentId)
    await Download.create(torrent).save()

    ctx.body = serializeTorrent(torrent)
  } catch (e) {
    ctx.status = 400
    ctx.body = e.message
  }
}

export async function listTorrents (ctx: Context) {
  ctx.body = downloader.client.torrents.map(serializeTorrent)
}
