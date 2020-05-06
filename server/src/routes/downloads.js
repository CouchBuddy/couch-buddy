const { client, serializeTorrent } = require('../services/downloader')
const config = require('../config')
const { Download } = require('../models')

async function addTorrent (ctx) {
  const magnetURI = ctx.request.body.magnetURI
  const torrentFile = ctx.request.files ? ctx.request.files.torrents : null

  ctx.assert(magnetURI || torrentFile, 400, 'You must provide the magnetURI field or upload a file')

  const opts = { path: config.mediaDir }

  // Torrent file has priority over magnetURI if both are present
  let torrentId
  if (torrentFile) {
    torrentId = torrentFile.path
  } else {
    torrentId = magnetURI
  }

  const t = await new Promise((resolve) => {
    client.add(torrentId, opts, async (torrent) => {
      await Download.create(torrent)
      resolve(torrent)
    })
  })

  ctx.body = serializeTorrent(t)
}

async function listTorrents (ctx) {
  ctx.body = client.torrents.map(serializeTorrent)
}

module.exports = {
  addTorrent,
  listTorrents
}
