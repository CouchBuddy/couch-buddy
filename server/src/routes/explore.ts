import { Context } from 'koa'

import { allExtensions } from '../services/extensions'

export async function searchMovies (ctx: Context) {
  const { search } = ctx.request.query

  ctx.assert(!Array.isArray(search), 400, 'Parameter `search` cannot be an array')

  if (!allExtensions.length) {
    ctx.status = 404
    ctx.body = 'Explore providers not found. Please install an Explore extension.'
    return
  }

  try {
    ctx.body = await allExtensions[0].explore(search)
  } catch (e) {
    console.log('error in explore', e)
  }
}
