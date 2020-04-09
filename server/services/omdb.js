const axios = require('axios')

const ALLOWED_TYPES = [ 'episode', 'movie', 'series' ]

/**
 * Search a movie, episode or show on OMDb. The query accepts multiple parameters,
 * but if IMDB ID is provided (`imdbId` field), the other search params are ignored.
 *
 * @param {Object} search can have `imdbId`, `title`, `season` and `episode` properties
 * @return {Object} the search result with fields name converted lower pascalCase
 *    (i.e.: Title becomes title) or null
 */
module.exports = async function searchOmdb (search) {
  let result = null

  try {
    const params = {
      apikey: process.env.OMDB_KEY
    }

    // If the IMDB ID is provided, it has precedence over anything else
    if (search.imdbId) {
      params.i = search.imdbId
    } else {
      if (search.title) { params.t = search.title }
      if (search.year) { params.y = search.year }
      if (ALLOWED_TYPES.includes(search.type)) { params.type = search.type }

      // If it's an episode, add S and E to force looking for a series' episode.
      // This helps for issue #34, series and movie with the same name
      if (search.season) { params.Season = search.season }
      if (search.episode) { params.Episode = search.episode }
    }

    const response = await axios.get('http://www.omdbapi.com/', { params })

    if (!response.data.Error) {
      result = {}

      // Found info on OMDb, refactor object to match Movie/Episode model
      for (const k in response.data) {
        result[k[0].toLowerCase() + k.slice(1)] = response.data[k] !== 'N/A'
          ? response.data[k] : null
      }

      result.imdbId = result.imdbID
      result.ratingImdb = result.imdbRating ? parseFloat(result.imdbRating) : null
      result.ratingMetacritic = result.metascore ? parseInt(result.metascore) : null

      const rt = result.ratings.find(x => x.Source === 'Rotten Tomatoes')
      if (rt) {
        result.ratingRottenTomatoes = parseInt(rt.Value)
      }
    } else {
      // Not found on OMDb
      console.warn('OMDb:', response.data.Error, search.title)
    }
  } catch (e) {
    console.log('OMDb request failed for:', search)
    console.error(e.message)
  }

  return result
}
