import axios from 'axios'

import config from '../config'
import Episode from '../models/Episode'
import Movie from '../models/Movie'

interface SearchParams {
  episode?: number;
  imdbId?: string;
  season?: number;
  title?: string;
  type: 'episode' | 'movie' | 'series';
  year?: number;
}

interface OmdbQueryParams {
  /**
   * API Key
   */
  apikey: string;

  /**
   * TV Series Episode number
   */
  Episode?: number;

  /**
   * Imdb ID
   */
  i?: string;

  /**
   * TV Series Season number
   */
  Season?: number;

  /**
   * Title
   */
  t?: string;

  /**
   * Show type
   */
  type?: 'episode' | 'movie' | 'series';

  /**
   * Year
   */
  y?: number;
}

/**
 * Search a movie, episode or show on OMDb. The query accepts multiple parameters,
 * but if IMDB ID is provided (`imdbId` field), the other search params are ignored.
 *
 * @param search
 * @return the search result with fields name converted lower pascalCase
 *    (i.e.: Title becomes title) or null
 */
export default async function searchOmdb (search: SearchParams) {
  let result: Movie | Episode = null

  try {
    const params: OmdbQueryParams = {
      apikey: config.omdbApiKey
    }

    // If the IMDB ID is provided, it has precedence over anything else
    if (search.imdbId) {
      params.i = search.imdbId
    } else {
      if (search.title) { params.t = search.title }
      if (search.year) { params.y = search.year }
      params.type = search.type

      // If it's an episode, add S and E to force looking for a series' episode.
      // This helps for issue #34, series and movie with the same name
      if (search.season) { params.Season = search.season }
      if (search.episode) { params.Episode = search.episode }
    }

    const response = await axios.get('http://www.omdbapi.com/', { params })

    if (!response.data.Error) {
      result = response.data.type === 'movie' ? new Movie() : new Episode()

      // Found info on OMDb, refactor object to match Movie/Episode model
      for (const k in response.data) {
        result[k[0].toLowerCase() + k.slice(1)] = response.data[k] !== 'N/A'
          ? response.data[k] : null
      }

      result.imdbId = response.data.imdbID
      result.rating = response.data.imdbRating ? parseFloat(response.data.imdbRating) : null
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
