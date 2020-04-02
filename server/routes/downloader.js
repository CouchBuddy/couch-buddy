const WebTorrent = require('webtorrent')

const client = new WebTorrent()

async function addTorrent (ctx) {
  const magnetURI = ctx.request.body.magnetURI
  ctx.assert(magnetURI, 400, 'Body field magnetURI is required')

  // const opts = { path: process.env.MEDIA_BASE_DIR }
  const opts = {}

  const t = await new Promise((resolve) => {
    client.add(magnetURI, opts, function (torrent) {
      console.log('Client is downloading:', torrent.infoHash)

      torrent.files.forEach(function (file) {
        console.log(file.name)
      })

      resolve(torrent)
    })
  })

  ctx.body = serializeTorrent(t)
}

async function listTorrents (ctx) {
  ctx.body = client.torrents.map(serializeTorrent)
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
