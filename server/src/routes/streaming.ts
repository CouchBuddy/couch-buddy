import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import { Context } from 'koa'
import mime from 'mime-types'
import { PassThrough } from 'stream'
import { Torrent } from 'webtorrent'

import config from '../config'
import MediaFile from '../models/MediaFile'
import { client as torrentClient } from '../services/downloader'

type SupportedCodecs = {
  [ codecType: string ]: string[];
}

const SUPPORTED_EXTENSIONS = [ 'mp4', 'mkv', 'avi' ]
const SUPPORTED_CODECS: { [userAgent: string]: SupportedCodecs } = {
  chrome: {
    audio: [ 'aac', 'ac3', 'mp3', 'vorbis', 'opus' ],
    video: [ 'h264', 'vp8', 'vp9' ] // msmpeg4v3, mpeg4
  },
  chromeCast: {
    audio: [ 'aac', 'ac3', 'mp3', 'vorbis', 'opus' ],
    video: [ 'h264', 'vp8' ]
  }
}

function ffprobe (path: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) { return reject(err) }

      resolve(metadata)
    })
  })
}

export async function watch (ctx: Context) {
  ctx.assert(/^(e|m|t)[a-f0-9]+$/.test(ctx.params.id), 400, 'Invalid ID format')

  const isTorrent = ctx.params.id[0] === 't'

  let mediaFile
  let torrentFile

  if (isTorrent) {
    const torrent: Torrent = torrentClient.get(ctx.params.id.slice(1)) || null
    ctx.assert(torrent, 404, 'Torrent not found')

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
  let mimeType: string = mime.lookup(isTorrent ? torrentFile.path : path) || null

  const metadata = await ffprobe(path)

  // Check if the media file needs transcoding or not
  const isSupported: { [codecType: string]: boolean } = {}

  for (const stream of metadata.streams) {
    if (SUPPORTED_CODECS['chrome'][stream.codec_type]) {
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

    videoStream = new PassThrough()

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
      'Content-Length': fileSize.toString(),
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
        'Content-Length': chunksize.toString(),
        'Content-Type': mimeType
      })
    } else {
      ctx.status = 200
      ctx.set({
        'Content-Length': fileSize.toString(),
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

async function getVideoFilePath (ctx: Context): Promise<string> {
  ctx.assert(/^(e|m|t)[a-f0-9]+$/.test(ctx.params.id), 400, 'Invalid ID format')

  const isTorrent = ctx.params.id[0] === 't'

  if (isTorrent) {
    const torrent = torrentClient.get(ctx.params.id.slice(1)) || null
    ctx.assert(torrent, 404, 'Media not found')

    // Find the first playable file
    const torrentFile = torrent.files.find(file => SUPPORTED_EXTENSIONS.includes(file.name.split('.').pop()))
    ctx.assert(torrentFile, 404, 'Torrent not found')

    return torrentFile.path
  } else {
    const mediaId = parseInt(ctx.params.id.slice(1))
    const mediaType = ctx.params.id[0] === 'm' ? 'movie' : 'episode'

    const mediaFile = await MediaFile.findOne({
      where: {
        mediaId,
        mediaType
      }
    })
    ctx.assert(mediaFile, 404, 'Media not found')

    return mediaFile.fileName
  }
}

export async function getMetadata (ctx: Context) {
  const filePath = await getVideoFilePath(ctx)

  ctx.body = await ffprobe(config.mediaDir + filePath)
}
