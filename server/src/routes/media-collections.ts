import { Context } from 'koa'
import { LessThan, getRepository, Brackets } from 'typeorm'

import Episode from '../models/Episode'
import Movie from '../models/Movie'

export async function continueWatching (ctx: Context) {
  // Find series where at least 1 episode has been watched
  const seriesWatched = await getRepository(Episode)
    .createQueryBuilder('episode')
    .where('watched >= 95')
    .groupBy('movieId')
    .getMany()

  // now find the next episodes (if any) of the watched series
  const nextEpisodes = await getRepository(Episode)
    .createQueryBuilder('episode')
    .where(new Brackets(qb => {
      qb.whereInIds(seriesWatched.map(e => e.movie.id))
      qb.andWhere('watched < 95')
      return qb
    }))
    .orWhere(new Brackets(qb => qb.where('watched > 0 AND watched < 95')))
    .orderBy({ season: 'ASC', episode: 'ASC' })
    .groupBy('movieId')
    .leftJoinAndSelect('episode.movie', 'movie')
    .getMany()

  const pendingMovies = await getRepository(Movie)
    .createQueryBuilder('Movie')
    .where('watched > 0')
    .andWhere('watched < 95')
    .getMany()

  const continueWatching: (Movie | Episode)[] = [
    ...nextEpisodes,
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

  const recentlyAdded: (Movie | Episode)[] = [
    ...await Movie.find({
      where: {
        type: 'movie',
        createdAt: LessThan(oneWeekAgo),
        watched: LessThan(95)
      },
      order: { createdAt: 'DESC' },
      take: 10
    }),

    ...await Episode.find({
      where: {
        createdAt: LessThan(oneWeekAgo),
        watched: LessThan(95)
      },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: [ 'movie' ]
    })
  ]

  ctx.body = recentlyAdded.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
