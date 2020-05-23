/// <reference types="chrome"/>
/// <reference types="chromecast-caf-sender"/>

import Vue from 'vue'
import Vuex from 'vuex'

import client, { setServerUrl } from '@/client'
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
        setServerUrl(state.serverUrl)
      }
    }
  },
  actions: {
    async fetchSystemInfo ({ commit }) {
      commit('setSystemInfo', (await client.get('/api/system')).data)
    },
    async castMovie ({ commit, state }, movie) {
      const castSession = cast.framework.CastContext.getInstance().getCurrentSession()

      if (!castSession) {
        throw new Error('Can\'t cast video: CastSession is null')
      }

      const watchId = `${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`

      const url = `${state.serverUrl}/api/watch/${watchId}`
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
        metadata.title = movie.title
        metadata.season = movie.season
        metadata.episode = movie.episode
        metadata.seriesTitle = movie.series ? movie.series.title : null
        metadata.originalAirdate = `${movie.year}`
        metadata.images = [
          new chrome.cast.Image(movie.poster)
        ]
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

      const request = new chrome.cast.media.LoadRequest(mediaInfo)

      if (subtitles.length) {
        request.activeTrackIds = [ subtitles[0].id ]
      }

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

        request.currentTime = duration * movie.watched / 100
      }

      await castSession.loadMedia(request)

      commit('setCastingMovie', movie)
    }
  },
  modules: {
    navigation
  }
})
