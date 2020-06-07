import Vue from 'vue'
import Vuex from 'vuex'

import client from '@/client'
import navigation from './navigation'

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
    async castMovie ({ commit, state }, { movies, startIndex = 0 }) {
      const castSession = cast.framework.CastContext.getInstance().getCurrentSession()

      const queueItems = []

      if (!Array.isArray(movies)) {
        movies = [ movies ]
      }

      for (const movie of movies) {
        const watchId = `${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`

        const url = `${state.serverUrl}/api/watch/${watchId}`
        // const mimeType = `video/${movie.container}`

        let metadata
        if (movie.type === 'movie') {
          metadata = new chrome.cast.media.MovieMediaMetadata()
          metadata.title = movie.title
          metadata.releaseDate = `${movie.year}`

          if (movie.poster) {
            metadata.images = [ new chrome.cast.Image(movie.poster) ]
          }
        } else {
          metadata = new chrome.cast.media.TvShowMediaMetadata()
          metadata.title = movie.title
          metadata.season = movie.season
          metadata.episode = movie.episode
          metadata.seriesTitle = movie.series ? movie.series.title : null
          metadata.originalAirdate = `${movie.year}`

          if (movie.poster) {
            metadata.images = [ new chrome.cast.Image(movie.poster) ]
          }
        }

        const subtitles = (await client.get(`/api/watch/${watchId}/subtitles`)).data

        const mediaInfo = new chrome.cast.media.MediaInfo(url)
        mediaInfo.metadata = metadata
        mediaInfo.tracks = subtitles.map(sub => {
          const track = new chrome.cast.media.Track(sub.id, chrome.cast.media.TrackType.TEXT)
          track.trackContentId = `${state.serverUrl}/api/subtitles/${sub.id}`
          track.trackContentType = 'text/vtt'
          track.subtype = chrome.cast.media.TextTrackType.SUBTITLES
          track.name = `${sub.lang} Subtitles`
          track.language = sub.lang

          return track
        })

        const queueItem = new chrome.cast.media.QueueItem(mediaInfo)

        if (subtitles.length) {
          queueItem.activeTrackIds = [ subtitles[0].id ]
        }

        queueItems.push(queueItem)

        /**
         * If the movie has not been completely watched,
         * start from the last watched point
         */
        if (movie.watched > 0 && movie.watched < 95) {
          const metadata = (await client.get(`/api/watch/${watchId}/metadata`)).data

          let duration = metadata.streams.find(s => s.codec_type === 'video').duration
          if (!duration || duration === 'N/A') {
            duration = metadata.format.duration
          }

          queueItem.startTime = duration * movie.watched / 100
        }
      }

      const request = new chrome.cast.media.QueueLoadRequest(queueItems)
      request.startIndex = startIndex
      // eslint-disable-next-line no-console
      console.log(request.items)

      castSession.getSessionObj().queueLoad(request)

      commit('setCastingMovie', movies[0])
    }
  },
  modules: {
    navigation
  }
})
