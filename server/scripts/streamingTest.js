const stream = require('stream')
const fs = require('fs')
const Koa = require('koa')
const ffmpeg = require('fluent-ffmpeg')

const VIDEO = '/media/luca/Luca HDD/videos/Romanzo Criminale - Tutta la serie tv [12 episodi] [MOIN]/Romanzo_Criminale.1x01.Episodio_1.avi'
const OUT = 'ciao.mp4'

const app = new Koa()

app.use((ctx, next) => {
  const videoStream = fs.createReadStream(VIDEO)
  const outStream = fs.createWriteStream(OUT)

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

app.listen(3001)

// var express = require('express')

// var app = express()

// app.get('/', function (req, res) {
//   res.contentType('mp4')

//   // make sure you set the correct path to your video file storage
//   ffmpeg(VIDEO)
//     .withAudioCodec('aac')
//     .format('mp4')
//     // setup event handlers
//     .on('end', function () {
//       console.log('file has been converted succesfully')
//     })
//     .on('error', function (err) {
//       console.log('an error happened: ' + err.message)
//     })
//     // save to stream
//     .addOption('-movflags', 'frag_keyframe+empty_moov')
//     .pipe(res, { end: true })
// })

// app.listen(3001)
