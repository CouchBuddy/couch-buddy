import { Context } from 'koa'
import { Torrent } from 'webtorrent'

import config from '../config'
import { client, serializeTorrent } from '../services/downloader'
import Download from '../models/Download'

export async function addTorrent (ctx: Context) {
  const magnetURI: string = ctx.request.body.magnetURI
  const torrentFile = ctx.request.files ? ctx.request.files.torrents : null

  ctx.assert(magnetURI || torrentFile, 400, 'You must provide the magnetURI field or upload a file')

  const opts = { path: config.mediaDir }

  // Torrent file has priority over magnetURI if both are present
  let torrentId: string

  if (torrentFile) {
    torrentId = torrentFile.path
  } else {
    torrentId = magnetURI
  }

  const t = await new Promise<Torrent>((resolve) => {
    client.add(torrentId, opts, async (torrent) => {
      Download.create(torrent)
      resolve(torrent)
    })
  })

  ctx.body = serializeTorrent(t)
}

export async function listTorrents (ctx: Context) {
  ctx.body = client.torrents.map(serializeTorrent)
}
