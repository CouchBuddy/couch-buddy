const extensions = require('../services/extensions')

async function searchMovies (ctx) {
  const { search } = ctx.request.query

  ctx.body = await extensions.allExtensions[0].search(search)
}

module.exports = {
  searchMovies
}
