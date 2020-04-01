const fs = require('fs')
const mime = require('mime-types')

const { MediaFile } = require('../models')

async function watch (ctx) {
  const mediaId = parseInt(ctx.params.id.slice(1))
  const mediaType = ctx.params.id[0] === 'm' ? 'movie' : 'episode'

  ctx.assert(/^(e|m)\d+$/.test(ctx.params.id), 400, 'Bad ID format')

  const mediaFile = await MediaFile.findOne({
    where: {
      mediaId,
      mediaType
    }
  })

  ctx.assert(mediaFile, 404, 'Media not found')

  const path = process.env.MEDIA_BASE_DIR + mediaFile.fileName
  let stat

  try {
    stat = fs.statSync(path)
  } catch (e) {
    ctx.throw(404, 'File not found: ' + path)
  }

  const fileSize = stat.size
  const range = ctx.request.get('range')
  const mimeType = mime.lookup(path)

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    const chunksize = (end - start) + 1
    const file = fs.createReadStream(path, { start, end })

    ctx.status = 206
    ctx.set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType
    })

    ctx.body = file
  } else {
    ctx.status = 206
    ctx.set({
      'Content-Length': fileSize,
      'Content-Type': mimeType
    })

    ctx.body = fs.createReadStream(path)
  }
}

module.exports = {
  watch
}
