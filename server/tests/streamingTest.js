const Koa = require('koa')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const stream = require('stream')

const config = require('../config')
const { MediaFile } = require('../models')

const SUPPORTED_FORMATS = {
  chrome: {
    audio: [ 'aac', 'ac3', 'mp3', 'vorbis', 'opus' ],
    video: [ 'h264', 'mpeg4', 'vp8', 'vp9' ] // msmpeg4v3
  },
  chromeCast: {
    audio: [ 'aac', 'ac3', 'mp3', 'vorbis', 'opus' ],
    video: [ 'h264', 'vp8' ]
  }
}

init()

async function init () {
  for (const media of await MediaFile.findAll()) {
    console.log(media.fileName)
    await ffprobe(media.fileName)
  }
}

async function ffprobe (file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(config.mediaDir + file, (err, info) => {
      if (err) { return reject(err) }

      let supported = false

      for (const stream of info.streams) {
        if (SUPPORTED_FORMATS.chrome[stream.codec_type]) {
          supported = SUPPORTED_FORMATS.chrome[stream.codec_type].includes(stream.codec_name)
        } else {
          supported = true
        }

        console.log(stream.codec_type, stream.codec_name, supported)
      }

      resolve()
    })
  })
}

const app = new Koa()

const VIDEO = 'some video path here.mp4'

app.use((ctx, next) => {
  const videoStream = fs.createReadStream(VIDEO)

  ctx.set('Content-Type', 'video/mp4')
  ctx.body = stream.PassThrough()

  ffmpeg(videoStream)
    .withAudioCodec('aac')
    .format('mp4')
    .on('end', () => {
      console.log('done')
    })
    .on('progress', (info) => {
      console.log('progress ', info.timemark)
    })
    .on('error', (err) => {
      console.log('err', err)
    })
    .addOption('-movflags', 'frag_keyframe+empty_moov')
    .pipe(ctx.body, { end: true })
})

// app.listen(3002)
