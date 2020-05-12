import assert from 'assert'
import { MovieDb } from 'moviedb-promise'
import {
  Episode,
  TvResult,
  MovieResponse,
  MovieResult,
  ShowResponse,
  EpisodeExternalIdsResponse,
  TvExternalIdsResponse
} from 'moviedb-promise/dist/request-types'

import config from '../config'
import EpisodeModel from '../models/Episode'
import Movie from '../models/Movie'

interface EpisodeWithExternalIds extends Episode {
  external_ids?: EpisodeExternalIdsResponse;
}

interface ShowWithExternalIds extends ShowResponse {
  external_ids?: TvExternalIdsResponse;
}

const client = new MovieDb(config.tmdbApiKey)

const sortByPopularityDesc = (a: MovieResult | TvResult, b: MovieResult | TvResult) => b.popularity - a.popularity

function toCBMovie (movie: MovieResponse): Movie {
  const cbModel = new Movie()

  cbModel.backdrop = movie.backdrop_path
  cbModel.country = movie.production_countries.map(x => x.name).join(', ')
  cbModel.genre = movie.genres.map(x => x.name).join(', ')
  cbModel.imdbId = movie.imdb_id
  cbModel.language = movie.original_language
  cbModel.plot = movie.overview
  cbModel.poster = movie.poster_path
  cbModel.runtime = movie.runtime
  cbModel.title = movie.title
  cbModel.type = 'movie'
  cbModel.vote = movie.vote_average
  cbModel.writer = null
  cbModel.year = movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null

  return cbModel
}

function toCBSeries (series: ShowResponse): Movie {
  const cbModel = new Movie()

  cbModel.backdrop = series.backdrop_path
  cbModel.country = series.origin_country.join(', ')
  cbModel.director = null
  cbModel.genre = series.genres ? series.genres.map(x => x.name).join(', ') : null
  cbModel.language = series.original_language
  cbModel.plot = series.overview
  cbModel.poster = series.poster_path
  cbModel.title = series.name
  cbModel.type = 'series'
  cbModel.vote = series.vote_average
  cbModel.year = series.first_air_date ? parseInt(series.first_air_date.slice(0, 4)) : null

  return cbModel
}

function toCBEpisode (episode: EpisodeWithExternalIds): EpisodeModel {
  const cbModel = new EpisodeModel()

  cbModel.episode = episode.episode_number
  cbModel.firstAired = episode.air_date
  cbModel.imdbId = episode.external_ids ? episode.external_ids.imdb_id : null
  cbModel.plot = episode.overview
  cbModel.poster = null
  cbModel.season = episode.season_number
  cbModel.title = episode.name
  cbModel.vote = episode.vote_average
  cbModel.year = episode.air_date ? parseInt(episode.air_date.slice(0, 4)) : null

  return cbModel
}

/**
 * Get Series info by ID
 * @param id
 */
export async function getMovieById (id: string | number) {
  return toCBMovie(
    // eslint-disable-next-line @typescript-eslint/camelcase
    await client.movieInfo({ id, append_to_response: 'external_ids' })
  )
}

/**
 * Get Series info by ID
 * @param id
 */
export async function getSeriesById (id: string | number) {
  // eslint-disable-next-line @typescript-eslint/camelcase
  const showResponse = await client.tvInfo({ id, append_to_response: 'external_ids' }) as ShowWithExternalIds

  const series = toCBSeries(showResponse)
  series.imdbId = showResponse.external_ids.imdb_id

  return series
}

/**
 * Search a single movie with details
 *
 * @param title
 * @param year
 */
export async function searchMovie (title: string, year?: number) {
  assert(!!title, 'title is required')

  const response = await client.searchMovie({ query: title, year })

  if (response.total_results > 0) {
    const mostPopular = response.results.sort(sortByPopularityDesc)[0]

    return toCBMovie(await client.movieInfo(mostPopular.id))
  }

  return null
}

/**
 * Search a series
 *
 * @param title
 */
export async function searchSeries (title: string) {
  assert(!!title, 'title is required')

  const response = await client.searchTv({ query: title })

  if (response.total_results > 0) {
    const mostPopular = response.results.sort(sortByPopularityDesc)[0]

    const externalIds = await client.tvExternalIds(mostPopular.id)

    const series = toCBSeries(mostPopular)
    series.imdbId = externalIds.imdb_id
    return series
  }

  return null
}

/**
 * Search an episode by its series title, season and episode.
 * All params are required
 *
 * @param seriesTitle
 * @param season
 * @param episode
 */
export async function searchEpisode (seriesTitle: string, seasonNumber: number, episodeNumber: number): Promise<EpisodeModel> {
  assert(!!seriesTitle, 'seriesTitle is required')
  assert(seasonNumber > 0, 'season must be > 0')
  assert(episodeNumber > 0, 'episode must be > 0')

  const response = await client.searchTv({ query: seriesTitle })

  if (!response.total_results) {
    return null
  }

  const mostPopular = response.results.sort(sortByPopularityDesc)[0]

  if (mostPopular && mostPopular.id) {
    const episodeInfo = await client.episodeInfo({
      id: mostPopular.id,
      // eslint-disable-next-line @typescript-eslint/camelcase
      season_number: seasonNumber,
      // eslint-disable-next-line @typescript-eslint/camelcase
      episode_number: episodeNumber,
      // eslint-disable-next-line @typescript-eslint/camelcase
      append_to_response: 'external_ids'
    }) as Episode

    const episode = toCBEpisode(episodeInfo)
    episode.movie = toCBSeries(mostPopular)

    const externalIds = await client.tvExternalIds(mostPopular.id)
    episode.movie.imdbId = externalIds.imdb_id

    return episode
  }

  return null
}
