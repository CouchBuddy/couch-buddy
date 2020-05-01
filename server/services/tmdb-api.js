const axios = require('axios').default

class TmdbApi {
  constructor (apiKey) {
    this.client = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  /**
   * Get Movie details
   * @param {String|Number} id A TMDB ID or an external ID from IMDB, TVDB, etc.
   *   See supported External IDs at: https://developers.themoviedb.org/3/getting-started/external-ids
   */
  async getMovieDetails (id) {
    const response = await this.client.get(`/movie/${id}`)
    return response.data
  }

  /**
   * Search Movies
   * @param {String} query
   * @param {Number} year
   * @param {Boolean} includeAdult
   * @param {Object} options
   * @param {Number} options.page
   */
  async searchMovies (query, year, includeAdult, { page } = {}) {
    const response = await this.client.get('/search/movie', {
      params: {
        query,
        page,
        year,
        include_adult: includeAdult
      }
    })

    return new SearchResponse(response.data)
  }

  /**
   * Search TV Shows
   * @param {String} query
   * @param {Number} firstAirDateYear
   * @param {Boolean} includeAdult
   * @param {Object} options
   * @param {Number} options.page
   */
  async searchTVShows (query, firstAirDateYear, includeAdult, { page } = {}) {
    const response = await this.client.get('/search/tv', {
      params: {
        query,
        page,
        first_air_date_year: firstAirDateYear,
        include_adult: includeAdult
      }
    })

    return new SearchResponse(response.data)
  }

  /**
   * Get TV Show details
   *
   * @param {String|Number} id A TMDB ID or an external ID from IMDB, TVDB, etc.
   *   See supported External IDs at: https://developers.themoviedb.org/3/getting-started/external-ids
   */
  async getTVShowDetails (id, { appendToResponse } = {}) {
    const response = await this.client.get(`/tv/${id}`, {
      params: { append_to_response: appendToResponse }
    })
    return response.data
  }

  async getTVShowExternalIds (id) {
    const response = await this.client.get(`/tv/${id}/external_ids`)
    return response.data
  }

  /**
   * Get TV Show Episode details
   *
   * @param {String|Number} tvShowId A TMDB ID or an external ID from IMDB, TVDB, etc.
   *   See supported External IDs at: https://developers.themoviedb.org/3/getting-started/external-ids
   * @param {Number} season
   * @param {Number} episode
   */
  async getTVEpisodeDetails (tvShowId, season, episode, { appendToResponse } = {}) {
    const response = await this.client.get(`/tv/${tvShowId}/season/${season}/episode/${episode}`, {
      params: { append_to_response: appendToResponse }
    })
    return response.data
  }
}

class SearchResponse {
  constructor (response) {
    /**
     * @type {Number}
     */
    this.page = response.page
    /**
     * @type {Number}
     */
    this.totalResults = response.total_results
    /**
     * @type {Number}
     */
    this.totalPages = response.total_pages
    /**
     * @type {Array}
     */
    this.results = response.results
  }
}

module.exports = TmdbApi
