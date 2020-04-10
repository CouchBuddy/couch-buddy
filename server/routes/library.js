const ffmpeg = require('fluent-ffmpeg')
const glob = require('glob')
const mime = require('mime-types')
const ptt = require('parse-torrent-title')
const path = require('path')
const sendFile = require('koa-send')
const { Op } = require('sequelize')

const config = require('../config')
const { Episode, MediaFile, Movie } = require('../models')
const omdb = require('../services/omdb')

ptt.addHandler('part', /(?:Part|CD)[. ]?([0-9])/i, { type: 'integer' })

async function scanLibrary (ctx = {}) {
  // Scan directory to search video files
  const videos = await searchVideoFiles(config.mediaDir)
  console.log(`Found ${videos.length} video files in ${config.mediaDir}`)

  const added = []

  for (const fileName of videos) {
    if (await addFileToLibrary(fileName)) {
      added.push(fileName)
    }
  }

  ctx.body = added
}

async function addFileToLibrary (_fileName, force = false) {
  if (!_fileName) {
    console.error('fileName is null')
    return
  }

  const fileName = path.isAbsolute(_fileName)
    ? path.relative(config.mediaDir, _fileName)
    : _fileName

  const mimeType = mime.lookup(fileName)
  if (!mimeType.startsWith('video/')) {
    console.log('Ignoring non-video file', fileName)
    return
  }

  const existingFile = await MediaFile.findOne({ where: { fileName } })

  // If the file has already been indexed, skip it or not based on `force`
  if (existingFile) {
    if (force) {
      console.log('Updating existing file:', fileName)
    } else {
      return
    }
  }

  // Parse filename to obtain basic info
  const fileBaseName = path.basename(fileName)
  const basicInfo = ptt.parse(fileBaseName)

  // Worst case scenario: ptt can't even find a title, so try to clean the filename
  if (!basicInfo.title) {
    basicInfo.title = fileBaseName
      // remove extension
      .replace(/\.[^/.]+$/, '')
      // replace . and _ with whitespace
      .replace(/[._]/, ' ')
      // remove parenthesis and their content
      .replace(/(\(.*\)|\[.*\])/, '')
      // remove everything after a dash
      .replace(/-.*$/, '')
      .trim()

    // worst-worst case: filename cleaned too much, just remove the extension
    basicInfo.title = basicInfo.title || fileBaseName.replace(/\.[^/.]+$/, '')

    console.log('PTT failed, obtained title from filename', basicInfo.title)
  }

  // Search movie info on OMDb
  let item = await omdb(basicInfo)

  // If we can't find anything on OMDb, at least we have basicInfo
  if (!item) {
    item = basicInfo
  }

  const isEpisode = !!item.season || !!item.episode || item.type === 'series' || item.type === 'episode'
  item.type = isEpisode ? 'series' : 'movie'

  let mediaId

  if (isEpisode) {
    // Search if the parent series of this episode is already in the DB,
    // if not, this is the first episode of the series encountered
    // and we need to find the series info
    const where = { type: 'series' }

    if (item.seriesID) {
      where.imdbId = item.seriesID
    } else {
      where.title = item.title
    }

    let series = await Movie.findOne({ where })

    if (!series) {
      item = await omdb(where)
      series = await Movie.create(item)
    }

    const thumbnail = await takeScreenshot(config.mediaDir + fileName)

    if (!existingFile) {
      const episode = await Episode.create({
        movieId: series.id,
        thumbnail,
        ...item
      })
      mediaId = episode.id
    } else {
      await Episode.update(item, { where: { id: existingFile.mediaId } })
      mediaId = existingFile.mediaId
    }
  } else {
    // It's a movie, create it if it doesn't exist already, this handles multiple
    // movie versions and parts (CD1, 2, ...)
    if (!existingFile) {
      const where = {}
      if (item.imdbId) {
        where.imdbId = item.imdbId
      } else {
        where.title = item.title
      }

      const [ movie ] = await Movie.findOrCreate({ where, defaults: item })
      mediaId = movie.id
    } else {
      await Movie.update(item, { where: { id: existingFile.mediaId } })
      mediaId = existingFile.mediaId
    }
  }

  if (!existingFile) {
    await MediaFile.create({
      fileName,
      mediaId,
      mediaType: isEpisode ? 'episode' : 'movie',
      mimeType,
      part: basicInfo.part
    })
  } else {
    await MediaFile.update({
      mediaId,
      mediaType: isEpisode ? 'episode' : 'movie',
      part: basicInfo.part
    }, {
      where: { id: existingFile.id }
    })
  }

  return true
}

async function listLibrary (ctx) {
  const where = {}

  if (ctx.request.query.search) {
    where.title = { [Op.like]: `%${ctx.request.query.search}%` }
  }

  const library = await Movie.findAll({ where, order: [[ 'title', 'ASC' ]] })

  ctx.body = library
}

async function getLibrary (ctx) {
  const movieId = parseInt(ctx.params.id)
  const movie = await Movie.findByPk(movieId)

  ctx.assert(movie, 404)

  ctx.body = movie
}

async function updateLibrary (ctx) {
  const movieId = parseInt(ctx.params.id)

  ctx.assert(movieId > 0, 404)

  const [ count ] = await Movie.update(ctx.request.body, {
    where: { id: movieId }
  })

  ctx.status = count === 1 ? 204 : 400
}

async function findMovieInfo (ctx) {
  const title = ctx.request.query.title
  const imdbId = ctx.request.query.imdbId

  ctx.assert(title || imdbId, 400, 'Param `title` or `imdbId` are required')

  ctx.status = 200
  ctx.body = await omdb({ imdbId, title })
}

async function getCollection (ctx) {
  if (ctx.params.what === 'continue-watching') {
    // Find series where at least 1 episode has been watched
    const seriesWatched = await Episode.findAll({
      where: { watched: { [Op.gte]: 95 } },
      group: [ 'movieId' ]
    })

    // now find the next episodes (if any) of the watched series
    const nextEpisodes = await Episode.findAll({
      where: {
        [Op.or]: [
          {
            movieId: { [Op.in]: seriesWatched.map(e => e.movieId) },
            watched: { [Op.or]: [{ [Op.lt]: 95 }, null ] }
          },
          { watched: { [Op.gt]: 0, [Op.lt]: 95 } }
        ]
      },
      order: [[ 'season', 'ASC' ], [ 'episode', 'ASC' ]],
      group: [ 'movieId' ]
    })

    const pendingMovies = await Movie.findAll({
      where: { watched: { [Op.gt]: 0, [Op.lt]: 95 } }
    })

    ctx.body = [
      ...nextEpisodes,
      ...pendingMovies
    ]
  }
}

async function listEpisodes (ctx) {
  const movieId = parseInt(ctx.params.id)
  ctx.assert(movieId, 404, 'Please provide an ID in the URL')

  const episodes = await Episode.findAll({
    where: { movieId },
    order: [[ 'season', 'ASC' ], [ 'episode', 'ASC' ]]
  })

  ctx.body = episodes
}

async function getEpisode (ctx) {
  const episodeId = parseInt(ctx.params.id)
  const episode = await Episode.findByPk(episodeId)

  ctx.assert(episode, 404)

  ctx.body = episode
}

async function getEpisodeThumbnail (ctx) {
  const episodeId = parseInt(ctx.params.id)
  const episode = await Episode.findByPk(episodeId)

  ctx.assert(episode, 404)

  await sendFile(ctx, episode.thumbnail, { root: config.mediaDir })
}

function searchVideoFiles (dir) {
  return new Promise((resolve, reject) => {
    const options = {
      cwd: dir,
      matchBase: true,
      nocase: true,
      nodir: true
    }

    glob('**/*.{mp4,mkv,avi}', options, (err, files) => {
      if (err) {
        reject(err)
      }

      resolve(files)
    })
  })
}

async function updateEpisode (ctx) {
  const episodeId = parseInt(ctx.params.id)

  ctx.assert(episodeId > 0, 404)

  const [ count ] = await Episode.update(ctx.request.body, {
    where: { id: episodeId }
  })

  ctx.status = count === 1 ? 204 : 400
}

function takeScreenshot (file) {
  const folder = path.dirname(file)
  const folderRelative = path.relative(config.mediaDir, folder)

  return new Promise((resolve) => {
    ffmpeg(file)
      .on('filenames', (filenames) => {
        resolve(path.join(folderRelative, filenames[0]))
      })
      .screenshots({ count: 1, filename: '%b.png', folder })
  })
}

module.exports = {
  findMovieInfo,
  getLibrary,
  listLibrary,
  scanLibrary,
  updateLibrary,

  getCollection,

  listEpisodes,
  getEpisode,
  getEpisodeThumbnail,
  updateEpisode,

  addFileToLibrary,
  searchVideoFiles,
  takeScreenshot
}
