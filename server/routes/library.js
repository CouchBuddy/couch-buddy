const sendFile = require('koa-send')
const { Op } = require('sequelize')

const config = require('../config')
const { Episode, Movie } = require('../models')
const { addFileToLibrary, searchVideoFiles } = require('../services/library')
const omdb = require('../services/omdb')

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

async function updateEpisode (ctx) {
  const episodeId = parseInt(ctx.params.id)

  ctx.assert(episodeId > 0, 404)

  const [ count ] = await Episode.update(ctx.request.body, {
    where: { id: episodeId }
  })

  ctx.status = count === 1 ? 204 : 400
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
  updateEpisode
}
