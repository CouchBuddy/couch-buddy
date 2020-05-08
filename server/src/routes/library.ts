import { Context } from 'koa'
import sendFile from 'koa-send'
// const { QueryTypes } = require('sequelize')

import config from '../config'
const { sequelize } = require('../models')
import Episode from '../models/Episode'
import Movie from '../models/Movie'
const { getResource, updateResource } = require('./rest-endpoints')
const { addFileToLibrary, searchVideoFiles } = require('../services/library')
import { getMovieById, searchMovie } from '../services/tmdb'

export async function scanLibrary (ctx: Context) {
  // Scan directory to search video files
  const videos = await searchVideoFiles(config.mediaDir)
  console.log(`Found ${videos.length} video files in ${config.mediaDir}`)

  const added: string[] = []

  for (const fileName of videos) {
    if (await addFileToLibrary(fileName)) {
      added.push(fileName)
    }
  }

  ctx.body = added
}

export async function listLibrary (ctx: Context) {
  if (ctx.request.query.search) {
    // Search movies with SQLite FTS5 MATCH operator
    const query = `SELECT movies.* FROM movies_fts
    INNER JOIN movies ON movies_fts.ID = movies.ID
    WHERE movies_fts
    MATCH '-ID:${ctx.request.query.search}'
    ORDER BY rank`

    ctx.body = await sequelize.query(query, { type: QueryTypes.SELECT })
  } else {
    ctx.body = await Movie.find({
      order: { title: 'ASC' },
      take: 30
    })
  }
}

export const getLibrary = getResource(Movie)
export const updateLibrary = updateResource(Movie)

export async function findMovieInfo (ctx: Context) {
  const title: string = ctx.request.query.title
  const imdbId: string = ctx.request.query.imdbId

  ctx.assert(title || imdbId, 400, 'Param `title` or `imdbId` are required')

  ctx.status = 200

  if (title) {
    ctx.body = await searchMovie(title)
  } else if (imdbId) {
    ctx.body = await getMovieById(imdbId)
  }
}

export async function listEpisodes (ctx: Context) {
  const movieId = parseInt(ctx.params.id)
  ctx.assert(movieId, 404, 'Please provide an ID in the URL')

  const episodes = await Episode.find({
    where: { movieId },
    order: { season: 'ASC', episode: 'ASC' }
  })

  ctx.body = episodes
}

export const getEpisode = getResource(Episode, { include: 'movie' })
export const updateEpisode = updateResource(Episode)

export async function getEpisodeThumbnail (ctx: Context) {
  const episodeId = parseInt(ctx.params.id)
  const episode = await Episode.findOne(episodeId)

  ctx.assert(episode, 404)

  await sendFile(ctx, episode.thumbnail, { root: config.mediaDir })
}
