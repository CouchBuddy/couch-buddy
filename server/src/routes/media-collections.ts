import { Context } from 'koa'
import { Brackets, Like, LessThan, MoreThan } from 'typeorm'

import Episode from '../models/Episode'
import Movie from '../models/Movie'

export async function continueWatching (ctx: Context) {
  // Find series where at least 1 episode has been watched
  const seriesWatched = await Episode.createQueryBuilder()
    .where('watched >= 95')
    .groupBy('movieId')
    // include movieId column as .movie
    .loadAllRelationIds()
    .getMany()

  // now find the next episodes (if any) of the watched series
  let nextEpisodes: Episode[] = []

  if (seriesWatched.length) {
    nextEpisodes = await Episode.createQueryBuilder('episodes')
      .where(new Brackets(qb => {
          qb
            .where('episodes.movie IN (:...ids)', { ids: seriesWatched.map(e => e.movie) })
            .andWhere('episodes.watched < 95')
        }
      ))
      .orderBy({ season: 'ASC', episode: 'ASC' })
      .groupBy('movieId')
      .leftJoinAndSelect('episodes.movie', 'movie')
      .getMany()
  }

  const pendingEpisodes: Episode[] = await Episode.createQueryBuilder('episodes')
    .where('episodes.watched > 0 AND episodes.watched < 95')
    .orderBy({ season: 'ASC', episode: 'ASC' })
    .leftJoinAndSelect('episodes.movie', 'movie')
    .getMany()

  const pendingMovies = await Movie.createQueryBuilder()
    .where('watched > 0')
    .andWhere('watched < 95')
    .getMany()

  const continueWatching: (Movie | Episode)[] = [
    ...nextEpisodes,
    ...pendingEpisodes,
    ...pendingMovies
  ]

  ctx.body = continueWatching.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

/**
 * Movies and Series Episodes added this week and not watched yet
 */
export async function recentlyAdded (ctx: Context) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const recentlyAdded = await Movie.find({
    where: {
      type: 'movie',
      createdAt: MoreThan(oneWeekAgo),
      watched: LessThan(95)
    },
    order: { createdAt: 'DESC' },
    take: 10
  })

  ctx.body = recentlyAdded.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

function getMoviesByGenre (genre: string) {
  return Movie.find({
    where: {
      genre: Like(`%${genre}%`),
      watched: LessThan(95)
    },
    order: { createdAt: 'DESC' },
    take: 10
  })
}

export async function byGenre (ctx: Context) {
  const { genre } = ctx.params

  ctx.body = await getMoviesByGenre(genre)
}
