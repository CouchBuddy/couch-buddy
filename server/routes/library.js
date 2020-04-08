const axios = require('axios')
const ffmpeg = require('fluent-ffmpeg')
const glob = require('glob')
const mime = require('mime-types')
const ptt = require('parse-torrent-title')
const path = require('path')
const sendFile = require('koa-send')
const { Op } = require('sequelize')

const { Episode, MediaFile, Movie } = require('../models')

const OMDB_KEY = process.env.OMDB_KEY

async function scanLibrary (ctx = {}) {
  // Scan directory to search video files
  const videos = await searchVideoFiles(process.env.MEDIA_BASE_DIR)
  console.log(`Found ${videos.length} video files in ${process.env.MEDIA_BASE_DIR}`)

  for (const fileName of videos) {
    addFileToLibrary(fileName)
  }

  ctx.status = 204
}

async function addFileToLibrary (fileName) {
  if (!fileName) {
    console.error('fileName is null')
    return
  }

  const mimeType = mime.lookup(fileName)
  if (!mimeType.startsWith('video/')) {
    console.log('Ignoring non-video file', fileName)
    return
  }

  // If the file has already been indexed, skip it
  const existingFile = await MediaFile.findOne({ where: { fileName } })

  if (existingFile) { return }

  // Parse filename to obtain basic info
  const basicInfo = ptt.parse(path.basename(fileName))

  const item = { ...basicInfo }

  // Search movie info on OMDb through title
  try {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        t: basicInfo.title,
        apikey: OMDB_KEY
      }
    })

    if (!response.data.Error) {
      // Found info on OMDb, refactor object to match Movie/Episode model
      for (const k in response.data) {
        item[k.toLowerCase()] = response.data[k]
      }

      item.imdbId = item.imdbid
      item.ratingImdb = parseFloat(item.imdbrating)
      item.ratingMetacritic = parseInt(item.metascore)

      const rt = item.ratings.find(x => x.Source === 'Rotten Tomatoes')
      if (rt) {
        item.ratingRottenTomatoes = parseInt(rt.Value)
      }
    } else {
      // Not found on OMDb
      console.warn(response.data.Error, basicInfo.title)
    }
  } catch (e) {
    console.log('OMDb request failed for:', basicInfo.title)
    console.error(e.message)
  }

  const where = {}
  if (item.imdbid) {
    where.imdbid = item.imdbid
  } else {
    where.title = item.title
  }

  const isSeries = !!item.season || !!item.episode || item.type === 'series'
  item.type = isSeries ? 'series' : 'movie'

  const [ movie ] = await Movie.findOrCreate({ where, defaults: item })
  let episode

  if (isSeries) {
    const absolutePath = process.env.MEDIA_BASE_DIR + fileName
    const thumbnail = await takeScreenshot(absolutePath)

    episode = await Episode.create({
      movieId: movie.id,
      thumbnail,
      ...item
    })
  }

  await MediaFile.create({
    fileName,
    mediaId: isSeries ? episode.id : movie.id,
    mediaType: isSeries ? 'episode' : 'movie',
    mimeType
  })

  return movie
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

  ctx.assert(title || imdbId, 400, 'Param `title` or `imdbDb` are required')

  const params = { apikey: OMDB_KEY }

  if (imdbId) {
    params.i = imdbId
  } else {
    params.t = title
  }

  try {
    const response = await axios.get('http://www.omdbapi.com/', { params })

    if (response.data.Error) {
      ctx.body = 'null'
    } else {
      const item = {}

      // Found info on OMDb, refactor object to match Movie/Episode model
      for (const k in response.data) {
        item[k.toLowerCase()] = response.data[k]
      }

      item.imdbId = item.imdbid
      item.ratingImdb = parseFloat(item.imdbrating)
      item.ratingMetacritic = parseInt(item.metascore)

      const rt = item.ratings.find(x => x.Source === 'Rotten Tomatoes')
      if (rt) {
        item.ratingRottenTomatoes = parseInt(rt.Value)
      }
      ctx.body = item
    }
  } catch (e) {
    ctx.throw(500, e.message)
  }
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

  await sendFile(ctx, episode.thumbnail, { root: process.env.MEDIA_BASE_DIR })
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
  const folderRelative = path.relative(process.env.MEDIA_BASE_DIR, folder)

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
