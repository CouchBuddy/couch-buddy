const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const mime = require('mime-types')

const config = require('../config')
const { client: torrentClient } = require('../services/downloader')
const { MediaFile } = require('../models')

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

  const metadata = await ffprobe(path)
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
      .seek(ctx.request.query.current_time || 0)
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

async function getMetadata (ctx) {
  const videoFile = await getVideoFile(ctx)

  ctx.body = await ffprobe(config.mediaDir + (videoFile.fileName || videoFile.path))
}

async function getVideoFile (ctx) {
  ctx.assert(/^(e|m|t)[a-f0-9]+$/.test(ctx.params.id), 400, 'Invalid ID format')

  const isTorrent = ctx.params.id[0] === 't'

  let videoFile

  if (isTorrent) {
    const torrent = torrentClient.get(ctx.params.id.slice(1))
    ctx.assert(torrent, 404, 'Media not found')

    // Find the first playable file
    videoFile = torrent.files.find(file => SUPPORTED_EXTENSIONS.includes(file.name.split('.').pop()))
  } else {
    const mediaId = parseInt(ctx.params.id.slice(1))
    const mediaType = ctx.params.id[0] === 'm' ? 'movie' : 'episode'

    videoFile = await MediaFile.findOne({
      where: {
        mediaId,
        mediaType
      }
    })
  }

  ctx.assert(videoFile, 404, 'Media not found')

  return videoFile
}

function ffprobe (path) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) { return reject(err) }

      resolve(metadata)
    })
  })
}

module.exports = {
  getMetadata,
  watch
}
