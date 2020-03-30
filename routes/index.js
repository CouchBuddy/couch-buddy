const fs = require('fs')
const router = require('@koa/router')()
const mime = require('mime-types')

const library = require('./library')

router.get('/library', library.listLibrary)
router.get('/library/:id', library.getLibrary)

router.get('/watch/:id', async ctx => {
  const library = require('../data/library.json')

  const movieId = parseInt(ctx.params.id)
  const movie = library.find(item => item.id === movieId)

  ctx.assert(movie, 404)

  const path = process.env.MEDIA_BASE_DIR + movie.filename
  const stat = fs.statSync(path)
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
})

module.exports = router
