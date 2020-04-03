const WebTorrent = require('webtorrent')

const { Download } = require('../models')

const client = new WebTorrent()
restoreTorrents()

async function addTorrent (ctx) {
  const magnetURI = ctx.request.body.magnetURI
  ctx.assert(magnetURI, 400, 'Body field magnetURI is required')

  const opts = { path: process.env.MEDIA_BASE_DIR }

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

async function restoreTorrents () {
  const downloads = await Download.findAll({
    where: { done: false }
  })

  const opts = { path: process.env.MEDIA_BASE_DIR }

  for (const download of downloads) {
    client.add(download.magnetURI, opts)
  }
}

function serializeTorrent (t) {
  return {
    infoHash: t.infoHash,
    name: t.name,
    timeRemaining: t.timeRemaining,
    progress: t.progress,
    downloadSpeed: t.downloadSpeed,
    uploadSpeed: t.uploadSpeed,
    paused: t.paused,
    done: t.done
  }
}

module.exports = {
  addTorrent,
  listTorrents
}
