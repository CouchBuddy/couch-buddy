import { Context } from 'koa'
import { LessThan, Between } from 'typeorm'

import Movie from '../models/Movie'
const { Episode } = require('../models')

async function continueWatching (ctx: Context) {
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
          movieId: { [Op.in]: seriesWatched.map((e: { movieId: number }) => e.movieId) },
          watched: { [Op.or]: [{ [Op.lt]: 95 }, null ] }
        },
        { watched: { [Op.gt]: 0, [Op.lt]: 95 } }
      ]
    },
    order: [[ 'season', 'ASC' ], [ 'episode', 'ASC' ]],
    group: [ 'movieId' ],
    include: 'movie'
  })

  const pendingMovies = await Movie.find({
    where: { watched: Between(0.1, 94.9) }
  })

  ctx.body = [
    ...nextEpisodes,
    ...pendingMovies
  ].sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * Movies and Series Episodes added this week and not watched yet
 */
async function recentlyAdded (ctx: Context) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  ctx.body = [
    ...await Movie.find({
      where: {
        type: 'movie',
        createdAt: LessThan(oneWeekAgo),
        watched: LessThan(95)
      },
      order: { 'createdAt': 'DESC' },
      take: 10
    }),

    ...await Episode.findAll({
      where: {
        createdAt: { [Op.gt]: oneWeekAgo },
        watched: { [Op.lt]: 95 }
      },
      order: [[ 'createdAt', 'DESC' ]],
      limit: 10,
      include: 'movie'
    })
  ].sort((a, b) => b.createdAt - a.createdAt)
}

module.exports = {
  continueWatching,
  recentlyAdded
}
