const { client, serializeTorrent } = require('../services/downloader')
const config = require('../config')
const { Download } = require('../models')

async function addTorrent (ctx) {
  const magnetURI = ctx.request.body.magnetURI
  ctx.assert(magnetURI, 400, 'Body field magnetURI is required')

  const opts = { path: config.mediaDir }

  const t = await new Promise((resolve) => {
    client.add(magnetURI, opts, async (torrent) => {
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
