import Vue from 'vue'
import Vuex from 'vuex'

import client from '@/client'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    castingMovie: null,
    isCastConnected: false,
    serverUrl: `${location.protocol}//${location.hostname}:3000`,
    systemInfo: {}
  },
  mutations: {
    setCastConnected (state, payload) {
      state.isCastConnected = payload
    },
    setCastingMovie (state, movie) {
      state.castingMovie = movie
    },
    setSystemInfo (state, payload) {
      state.systemInfo = payload

      if (payload.ipAddresses.length) {
        state.serverUrl = `http://${payload.ipAddresses[0]}:3000`
        client.baseURL = state.serverUrl
      }
    }
  },
  actions: {
    async fetchSystemInfo ({ commit }) {
      commit('setSystemInfo', (await client.get('/api/system')).data)
    },
    /* global cast, chrome */
    async castMovie ({ commit, state }, movie) {
      const castSession = cast.framework.CastContext.getInstance().getCurrentSession()

      const url = `${state.serverUrl}/api/watch/${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`
      // const mimeType = `video/${movie.container}`

      let metadata
      if (movie.type === 'movie') {
        metadata = new chrome.cast.media.MovieMediaMetadata()
        metadata.title = movie.title
        metadata.releaseDate = `${movie.year}`
        metadata.images = [
          new chrome.cast.Image(movie.poster)
        ]
      } else {
        metadata = new chrome.cast.media.TvShowMediaMetadata()
        metadata.seriesTitle = movie.title
        metadata.season = movie.season
        metadata.episode = movie.episode
        metadata.originalAirdate = `${movie.year}`
        metadata.images = [
          // the poster of the main movie, not the thumb of the episode
          new chrome.cast.Image(this.movie.poster)
        ]
      }

      const mediaInfo = new chrome.cast.media.MediaInfo(url)
      // mediaInfo.contentId = url
      mediaInfo.metadata = metadata

      const request = new chrome.cast.media.LoadRequest(mediaInfo)
      await castSession.loadMedia(request)

      commit('setCastingMovie', movie)
    }
  },
  modules: {
  }
})
