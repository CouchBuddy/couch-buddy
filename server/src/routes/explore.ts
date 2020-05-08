import { Context } from 'koa'

import { allExtensions } from '../services/extensions'

export async function searchMovies (ctx: Context) {
  const { search } = ctx.request.query

  ctx.body = allExtensions[0].search(search)
}
