const assert = require('assert')
const TmdbApi = require('moviedb-promise')

const config = require('../config')

const client = new TmdbApi(config.tmdbApiKey)

/**
 * Get Series info by ID
 * @param {String|Number} id
 */
async function getMovieById (id) {
  return toCBMovie(
    await client.movieInfo(id, { append_to_response: 'external_ids' })
  )
}

/**
 * Get Series info by ID
 * @param {String|Number} id
 */
async function getSeriesById (id) {
  return toCBSeries(
    await client.tvInfo(id, { append_to_response: 'external_ids' })
  )
}

/**
 * Search a single movie with details
 *
 * @param {String} title
 * @param {Number} year
 */
async function searchMovie (title, year) {
  assert(!!title, 'title is required')

  const response = await client.searchMovie({ query: title, year })
  console.log(response)

  if (response.total_results > 0) {
    const mostPopular = response.results.sort(sortByPopularityDesc)[0]

    return toCBMovie(await client.movieInfo(mostPopular.id))
  }
}

/**
 * Search a series
 *
 * @param {String} title
 */
async function searchSeries (title) {
  assert(!!title, 'title is required')

  const response = await client.searchTv({ query: title })

  if (response.total_results > 0) {
    const mostPopular = response.results.sort(sortByPopularityDesc)[0]

    return toCBSeries({
      ...await client.tvExternalIds(mostPopular.id),
      ...mostPopular
    })
  }
}

/**
 * Search an episode by its series title, season and episode.
 * All params are required
 *
 * @param {String} seriesTitle
 * @param {Number} season
 * @param {Number} episode
 */
async function searchEpisode (seriesTitle, season, episode) {
  assert(!!seriesTitle, 'seriesTitle is required')
  assert(season > 0, 'season must be > 0')
  assert(episode > 0, 'episode must be > 0')

  const series = await searchSeries(seriesTitle)

  if (series && series.tmdbId) {
    const episodeInfo = await client.tvEpisodeInfo({
      id: series.tmdbId,
      season_number: season,
      episode_number: episode
    },
    {
      appendToResponse: 'external_ids'
    })

    return {
      ...toCBEpisode(episodeInfo),
      movie: series
    }
  }
}

function toCBMovie (movie) {
  return {
    tmdbId: movie.id,
    actors: null,
    awards: null,
    backdrop: movie.backdrop_path,
    country: movie.production_countries.map(x => x.name).join(', '),
    director: null,
    genre: movie.genres.map(x => x.name).join(', '),
    imdbId: movie.imdb_id,
    language: movie.original_language,
    plot: movie.overview,
    poster: movie.poster_path,
    rated: null,
    ratingImdb: movie.vote_average,
    ratingMetacritic: null,
    ratingRottenTomatoes: null,
    released: movie.release_date,
    resolution: null,
    runtime: movie.runtime,
    title: movie.title,
    type: 'movie',
    writer: null,
    year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null
  }
}

function toCBSeries (series) {
  return {
    tmdbId: series.id,
    actors: null,
    awards: null,
    backdrop: series.backdrop_path,
    country: series.origin_country.join(', '),
    director: null,
    genre: series.genres ? series.genres.map(x => x.name).join(', ') : null,
    imdbId: series.imdb_id,
    language: series.original_language,
    plot: series.overview,
    poster: series.poster_path,
    rated: null,
    ratingImdb: series.vote_average,
    ratingMetacritic: null,
    ratingRottenTomatoes: null,
    released: series.first_air_date,
    resolution: null,
    runtime: null,
    title: series.name,
    type: 'series',
    writer: null,
    year: series.first_air_date ? parseInt(series.first_air_date.slice(0, 4)) : null
  }
}

function toCBEpisode (episode) {
  return {
    tmdbId: episode.id,
    actors: null,
    director: null,
    episode: episode.episode_number,
    firstAired: episode.air_date,
    imdbId: episode.external_ids ? episode.external_ids.imdb_id : null,
    plot: episode.overview,
    poster: null,
    ratingImdb: episode.vote_average,
    ratingMetascore: null,
    ratingRottenTomatoes: null,
    resolution: null,
    runtime: null,
    season: episode.season_number,
    thumbnail: null,
    title: episode.name,
    watched: null,
    writer: null,
    year: episode.air_date ? parseInt(episode.air_date.slice(0, 4)) : null
  }
}

const sortByPopularityDesc = (a, b) => b.popularity - a.popularity

module.exports = {
  getMovieById,
  getSeriesById,
  searchEpisode,
  searchMovie,
  searchSeries
}
