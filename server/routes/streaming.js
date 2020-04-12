const axios = require('axios')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const mime = require('mime-types')
const sendFile = require('koa-send')
const OS = require('opensubtitles-api')
const srt2vtt = require('srt-to-vtt')

const config = require('../config')
const { client: torrentClient } = require('../services/downloader')
const { Episode, MediaFile, Movie, SubtitlesFile } = require('../models')
const getSubLangID = require('../utils/openSubtitlesLangs')

const SUPPORTED_EXTENSIONS = [ 'mp4', 'mkv', 'avi' ]
// const SUPPORTED_MIMETYPES = [
//   'video/mp4',
//   'video/x-matroska'
// ]
const SUPPORTED_CODECS = {
  chrome: {
    audio: [ 'aac', 'ac3', 'mp3', 'vorbis', 'opus' ],
    video: [ 'h264', 'vp8', 'vp9' ] // msmpeg4v3, mpeg4
  },
  chromeCast: {
    audio: [ 'aac', 'ac3', 'mp3', 'vorbis', 'opus' ],
    video: [ 'h264', 'vp8' ]
  }
}

let OpenSubtitles = null

async function watch (ctx) {
  ctx.assert(/^(e|m|t)[a-f0-9]+$/.test(ctx.params.id), 400, 'Invalid ID format')

  const isTorrent = ctx.params.id[0] === 't'

  let mediaFile
  let torrentFile

  if (isTorrent) {
    const torrent = torrentClient.get(ctx.params.id.slice(1))
    ctx.assert(torrent, 404, 'Media not found')

    // Find the first playable file
    torrentFile = torrent.files.find(file => SUPPORTED_EXTENSIONS.includes(file.name.split('.').pop()))
  } else {
    const mediaId = parseInt(ctx.params.id.slice(1))
    const mediaType = ctx.params.id[0] === 'm' ? 'movie' : 'episode'

    mediaFile = await MediaFile.findOne({
      where: {
        mediaId,
        mediaType
      }
    })
  }

  ctx.assert(mediaFile || torrentFile, 404, 'Media not found')

  let path
  let stat

  if (!isTorrent) {
    path = config.mediaDir + mediaFile.fileName
    try {
      stat = fs.statSync(path)
    } catch (e) {
      ctx.throw(404, 'File not found: ' + path)
    }
  }

  const fileSize = isTorrent ? torrentFile.length : stat.size
  let range = ctx.request.get('range')
  let mimeType = mime.lookup(isTorrent ? torrentFile.path : path)

  const metadata = await getVideoMetadata(path)
  const isSupported = { audio: false, video: false }

  for (const stream of metadata.streams) {
    if (SUPPORTED_CODECS.chrome[stream.codec_type]) {
      isSupported[stream.codec_type] =
        SUPPORTED_CODECS.chrome[stream.codec_type].includes(stream.codec_name)
    } else {
      isSupported[stream.codec_type] = true
    }
  }

  // Stream that will be sent as response
  let videoStream

  // Need transcoding
  if (!isTorrent && (!isSupported.audio || !isSupported.video)) {
    console.log('transcoding')
    mimeType = 'video/mp4'
    range = null

    videoStream = require('stream').PassThrough()

    ffmpeg(path)
      .withVideoCodec(isSupported.video ? 'copy' : 'libx264')
      .withAudioCodec(isSupported.audio ? 'copy' : 'aac')
      .format('mp4')
      .on('error', (err) => {
        console.log('FFMPEG error:', err)
      })
      .addOption('-movflags', 'frag_keyframe+empty_moov')
      .pipe(videoStream, { end: true })

    ctx.status = 200
    ctx.set({
      'Content-Length': fileSize,
      'Content-Type': mimeType
    })
  } else {
    // Serve a static file
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      const chunksize = (end - start) + 1

      if (isTorrent) {
        videoStream = torrentFile.createReadStream({ start, end })
      } else {
        videoStream = fs.createReadStream(path, { start, end })
      }

      ctx.status = 206
      ctx.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType
      })
    } else {
      ctx.status = 200
      ctx.set({
        'Content-Length': fileSize,
        'Content-Type': mimeType
      })

      if (isTorrent) {
        videoStream = torrentFile.createReadStream()
      } else {
        videoStream = fs.createReadStream(path)
      }
    }
  }

  ctx.body = videoStream
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

  await sendFile(ctx, subtitles.fileName, { root: config.mediaDir })
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

  if (!OpenSubtitles) {
    OpenSubtitles = new OS(config.openSubtitlesUa)
  }

  // Search subtitles using movie hash
  let result = await OpenSubtitles.search({
    sublanguageid: sublanguageId,
    path: config.mediaDir + mediaFile.fileName
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
  await stream.pipe(fs.createWriteStream(config.mediaDir + fileName))

  ctx.body = await SubtitlesFile.create({
    fileName,
    lang,
    mediaId,
    mediaType
  })
}

function getVideoMetadata (path) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) { return reject(err) }

      resolve(metadata)
    })
  })
}

module.exports = {
  downloadSubtitles,
  getSubtitles,
  listSubtitles,

  watch
}
