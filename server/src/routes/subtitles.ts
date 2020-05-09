import axios from 'axios'
import fs from 'fs'
import { Context } from 'koa'
import sendFile from 'koa-send'
import OpenSubtitles from 'opensubtitles-api'
import path from 'path'
import srt2vtt from 'srt-to-vtt'

import config from '../config'
import Episode from '../models/Episode'
import MediaFile from '../models/MediaFile'
import Movie from '../models/Movie'
import SubtitlesFile from '../models/SubtitlesFile'
import getSubLangID from '../utils/open-subtitles-langs'

let osClient: OpenSubtitles = null

export async function listSubtitles (ctx: Context) {
  ctx.assert(/^(e|m)\d+$/.test(ctx.params.wid), 400, 'Invalid ID format')

  const mediaId = parseInt(ctx.params.wid.slice(1))
  const mediaType = ctx.params.wid[0] === 'm' ? 'movie' : 'episode'

  const subtitles = await SubtitlesFile.find({
    where: {
      mediaId,
      mediaType
    }
  })

  ctx.body = subtitles
}

export async function getSubtitles (ctx: Context) {
  const id = parseInt(ctx.params.id)
  ctx.assert(id >= 1, 400, 'Invalid ID')

  const subtitles = await SubtitlesFile.findOne(id)

  ctx.assert(subtitles, 404)

  await sendFile(ctx, subtitles.fileName, { root: config.mediaDir })
}

export async function downloadSubtitles (ctx: Context) {
  ctx.assert(/^(e|m)\d+$/.test(ctx.params.wid), 400, 'Invalid ID format')

  const mediaId = parseInt(ctx.params.wid.slice(1))
  const mediaType = ctx.params.wid[0] === 'm' ? 'movie' : 'episode'
  const lang: string = ctx.request.body.lang
  const sublanguageId = getSubLangID(lang)

  let media: Movie | Episode

  if (mediaType === 'movie') {
    media = await Movie.findOne(mediaId)
  } else {
    media = await Episode.findOne(mediaId)
  }

  const mediaFile = await MediaFile.findOne({
    where: {
      mediaId,
      mediaType
    }
  })

  ctx.assert(mediaFile, 404, 'Media not found')

  if (!osClient) {
    osClient = new OpenSubtitles(config.openSubtitlesUa)
  }

  // Search subtitles using movie hash
  let result = await osClient.search({
    sublanguageid: sublanguageId,
    path: config.mediaDir + mediaFile.fileName
  })

  // Search again using only IMDB ID
  if (!result[lang]) {
    result = await osClient.search({
      sublanguageid: sublanguageId,
      imdbid: media.imdbId
    })
  }

  const subtitles = result[lang]
  ctx.assert(subtitles, 404, 'No subtitles found')

  // Remember what format we are downloading, needed later for conversion
  const isVtt = false

  let response
  try {
    // Note: subtitles download URL is available also in VTT format, but sometimes is a broken URL,
    // so download the .srt as it is more reliable
    response = await axios.get(subtitles.url, {
      responseType: 'stream'
    })
  } catch (e) {
    ctx.status = 400
    ctx.body = 'OpenSubtitles.org error'
    console.log('Error downloading subs file', subtitles)
    return
  }

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

  const mediaFileDir = path.dirname(mediaFile.fileName)

  await stream.pipe(
    fs.createWriteStream(
      // Save subtitles in video file directory
      path.join(config.mediaDir, mediaFileDir, fileName)
    )
  )

  ctx.body = await SubtitlesFile.create({
    fileName: path.join(mediaFileDir, fileName),
    lang,
    mediaId,
    mediaType
  })
}
