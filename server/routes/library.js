const sendFile = require('koa-send')
const { Op } = require('sequelize')

const config = require('../config')
const { Episode, Movie } = require('../models')
const { getResource, updateResource } = require('./rest-endpoints')
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

const getLibrary = getResource(Movie)
const updateLibrary = updateResource(Movie)

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

const getEpisode = getResource(Episode, { include: 'movie' })
const updateEpisode = updateResource(Episode)

async function getEpisodeThumbnail (ctx) {
  const episodeId = parseInt(ctx.params.id)
  const episode = await Episode.findByPk(episodeId)

  ctx.assert(episode, 404)

  await sendFile(ctx, episode.thumbnail, { root: config.mediaDir })
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
