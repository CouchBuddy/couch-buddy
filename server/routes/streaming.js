const axios = require('axios')
const fs = require('fs')
const mime = require('mime-types')
const sendFile = require('koa-send')
const OS = require('opensubtitles-api')
var srt2vtt = require('srt-to-vtt')

const { Episode, MediaFile, Movie, SubtitlesFile } = require('../models')
const getSubLangID = require('../utils/openSubtitlesLangs')

const OpenSubtitles = new OS(process.env.OPENSUBTITLES_UA)

async function watch (ctx) {
  ctx.assert(/^(e|m)\d+$/.test(ctx.params.id), 400, 'Invalid ID format')

  const mediaId = parseInt(ctx.params.id.slice(1))
  const mediaType = ctx.params.id[0] === 'm' ? 'movie' : 'episode'

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

async function listSubtitles (ctx) {
  ctx.assert(/^(e|m)\d+$/.test(ctx.params.wid), 400, 'Invalid ID format')

  const mediaId = parseInt(ctx.params.wid.slice(1))
  const mediaType = ctx.params.wid[0] === 'm' ? 'movie' : 'episode'

  const subtitles = await SubtitlesFile.findAll({
    where: {
      mediaId,
      mediaType
    }
  })

  ctx.body = subtitles
}

async function getSubtitles (ctx) {
  const id = parseInt(ctx.params.id)
  ctx.assert(id >= 1, 400, 'Invalid ID')

  const subtitles = await SubtitlesFile.findByPk(id)

  ctx.assert(subtitles, 404)

  await sendFile(ctx, subtitles.fileName, { root: process.env.MEDIA_BASE_DIR })
}

async function downloadSubtitles (ctx) {
  ctx.assert(/^(e|m)\d+$/.test(ctx.params.wid), 400, 'Invalid ID format')

  const mediaId = parseInt(ctx.params.wid.slice(1))
  const mediaType = ctx.params.wid[0] === 'm' ? 'movie' : 'episode'
  const lang = ctx.request.body.lang
  const sublanguageId = getSubLangID(lang)

  let media
  if (mediaType === 'movie') {
    media = await Movie.findByPk(mediaId)
  } else {
    media = await Episode.findByPk(mediaId)
  }

  const mediaFile = await MediaFile.findOne({
    where: {
      mediaId,
      mediaType
    }
  })

  ctx.assert(mediaFile, 404, 'Media not found')

  // Search subtitles using movie hash
  let result = await OpenSubtitles.search({
    sublanguageid: sublanguageId,
    path: process.env.MEDIA_BASE_DIR + mediaFile.fileName
  })

  // Search again using only IMDB ID
  if (!result[lang]) {
    result = await OpenSubtitles.search({
      sublanguageid: sublanguageId,
      imdbid: media.imdbid
    })
  }

  const subtitles = result[lang]
  ctx.assert(subtitles, 404, 'No subtitles found')

  // Remember what format we are downloading, needed later for conversion
  const isVtt = !!subtitles.vtt

  const response = await axios.get(subtitles.vtt || subtitles.url, {
    responseType: 'stream'
  })

  // Find subtitles filename with several strategies
  // 1. name of the downloaded file as in HTTP headers
  // 2. from the OS API
  // 3. use name of the video file
  let fileName

  if (response.headers['Content-Disposition']) {
    const m = response.headers['Content-Disposition'].match(/filename="(.*)"/)
    if (m) {
      fileName = m[1]
    }
  } else if (subtitles.filename) {
    fileName = subtitles.filename
  } else {
    fileName = mediaFile.fileName
  }

  // Append .lang to avoid filename clash and set .vtt extension
  fileName = fileName.replace(/\.[^/.]+$/, `.${lang}.vtt`)

  let stream = response.data
  if (!isVtt) {
    stream = stream.pipe(srt2vtt())
  }
  await stream.pipe(fs.createWriteStream(process.env.MEDIA_BASE_DIR + fileName))

  ctx.body = await SubtitlesFile.create({
    fileName,
    lang,
    mediaId,
    mediaType
  })
}

module.exports = {
  downloadSubtitles,
  getSubtitles,
  listSubtitles,

  watch
}
