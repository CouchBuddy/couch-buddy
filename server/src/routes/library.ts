import { Context } from 'koa'
import sendFile from 'koa-send'

import config from '../config'
import Episode from '../models/Episode'
import Movie from '../models/Movie'
import { getResource, listResource, updateResource } from './rest-endpoints'
import { addFileToLibrary, searchVideoFiles } from '../services/library'
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

export async function search (ctx: Context) {
  ctx.assert(ctx.request.query.search, 400, 'search cannot be empty')

  // Search movies with SQLite FTS5 MATCH operator
  // const query = `SELECT movies.* FROM movies_fts
  // INNER JOIN movies ON movies_fts.ID = movies.ID
  // WHERE movies_fts
  // MATCH '-ID:${ctx.request.query.search}'
  // ORDER BY rank`

  const results: Movie[] = await Movie.getRepository()
    .createQueryBuilder('movies')
    .innerJoin('movies_fts', 'movies_fts', 'movies_fts.ID = movies.ID')
    .where(`movies_fts MATCH '-ID:${ctx.request.query.search}'`)
    .orderBy('rank')
    .getMany()

  ctx.body = results
}

export const listLibrary = listResource(Movie)
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
  ctx.assert(movieId >= 1, 400, 'Series id is not valid, it must be a positive integer')

  const episodes = await Episode.find({
    where: { movie: movieId },
    order: { season: 'ASC', episode: 'ASC' }
  })

  ctx.body = episodes
}

export const getEpisode = getResource(Episode)
export const updateEpisode = updateResource(Episode)

export async function getEpisodeThumbnail (ctx: Context) {
  const episodeId = parseInt(ctx.params.id)
  const episode = await Episode.findOne(episodeId)

  ctx.assert(episode, 404)

  await sendFile(ctx, episode.thumbnail, { root: config.mediaDir })
}
