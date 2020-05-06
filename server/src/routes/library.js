const sendFile = require('koa-send')
const { QueryTypes } = require('sequelize')

const config = require('../config')
const { Episode, Movie, sequelize } = require('../models')
const { getResource, updateResource } = require('./rest-endpoints')
const { addFileToLibrary, searchVideoFiles } = require('../services/library')
const movieInfoProvider = require('../services/tmdb')

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
  if (ctx.request.query.search) {
    // Search movies with SQLite FTS5 MATCH operator
    const query = `SELECT movies.* FROM movies_fts
    INNER JOIN movies ON movies_fts.ID = movies.ID
    WHERE movies_fts
    MATCH '-ID:${ctx.request.query.search}'
    ORDER BY rank`

    ctx.body = await sequelize.query(query, { type: QueryTypes.SELECT })
  } else {
    ctx.body = await Movie.findAll({ order: [[ 'title', 'ASC' ]] })
  }
}

const getLibrary = getResource(Movie)
const updateLibrary = updateResource(Movie)

async function findMovieInfo (ctx) {
  const title = ctx.request.query.title
  const imdbId = ctx.request.query.imdbId

  ctx.assert(title || imdbId, 400, 'Param `title` or `imdbId` are required')

  ctx.status = 200

  if (title) {
    ctx.body = await movieInfoProvider.searchMovie(title)
  } else if (imdbId) {
    ctx.body = await movieInfoProvider.getMovieById(imdbId)
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

  listEpisodes,
  getEpisode,
  getEpisodeThumbnail,
  updateEpisode
}
