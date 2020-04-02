<template>
  <div>
    <div class="flex flex-col md:flex-row">
      <div class="w-full md:w-1/3">
        <img
          class="w-full"
          :src="movie.poster"
        >
      </div>

      <div class="w-full md:ml-8 md:w-2/3">
        <h2 class="text-4xl">
          {{ movie.title }}
        </h2>

        <div class="mb-2 text-gray-600">
          <small>{{ movie.year }}</small>
        </div>

        <div>{{ movie.plot }}</div>

        <div class="mt-4 text-gray-600">
          Cast: {{ movie.actors }}
        </div>

        <div class="mt-4 text-gray-600">
          Directed by {{ movie.director }}
        </div>

        <div class="flex justify-evenly mt-8 text-center">
          <button
            class="px-4 py-2 border-2 border-white"
            @click="playMovie(movie)"
          >
            {{ movie.type === 'series' ? 'Play Next Episode' : 'Play' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-for="(episodes, season) in episodesBySeason"
      :key="`season-${season}`"
    >
      <div class="mt-8 mb-4">
        SEASON {{ season }}
      </div>

      <div class="horizontal-scroller">
        <div
          v-for="episode in episodes"
          :key="`episode-${episode.id}`"
          class="flex justify-center items-center text-4xl bg-gray-600 rounded-lg"
          @click="playMovie(episode)"
        >
          {{ episode.episode }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global chrome, cast */
import { mapState } from 'vuex'

import client from '@/client'
import config from '@/config'

export default {
  name: 'Movie',
  data: () => ({
    episodesBySeason: {},
    movie: {},
    movieId: null
  }),
  computed: {
    ...mapState(['isCastConnected'])
  },
  async mounted () {
    this.movieId = parseInt(this.$route.params.id)

    const response = await client.get(`/api/library/${this.movieId}`)
    this.movie = response.data

    if (this.movie.type === 'series') {
      this.fetchEpisodes(this.movie.id)
    }
  },
  methods: {
    async fetchEpisodes (seriesId) {
      const response = await client.get(`/api/library/${this.movieId}/episodes`)
      this.episodesBySeason = response.data.reduce((r, v, i, a, k = v.season) => { (r[k] || (r[k] = [])).push(v); return r }, {})
    },
    playMovie (movie) {
      if (this.isCastConnected) {
        this.castMovie(movie)
      } else {
        this.$router.push({ name: 'watch', params: { id: this.getWatchId(movie) } })
      }
    },
    async castMovie (movie) {
      const castSession = cast.framework.CastContext.getInstance().getCurrentSession()

      const url = `${config.serverUrl}/api/watch/${this.getWatchId(movie)}`
      // const mimeType = `video/${movie.container}`

      const mediaInfo = new chrome.cast.media.MediaInfo(url)
      const request = new chrome.cast.media.LoadRequest(mediaInfo)

      try {
        await castSession.loadMedia(request)
      } catch (e) {
        console.error(e, url)
      }
    },
    getWatchId (movie) {
      return `${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`
    }
  }
}
</script>

<style lang="scss">
.horizontal-scroller {
  display: grid;
  gap: 2rem;
  grid-template-columns: 4rem;
  grid-template-rows: minmax(150px, 1fr);
  grid-auto-flow: column;
  grid-auto-columns: calc(30% - 40px * 2);
  overflow-x: scroll;
  scroll-snap-type: x proximity;
  margin: 0px -5vw;

  &:before,
  &:after {
    content: '';
    width: 10px;
  }

  & > * {
    scroll-snap-align: center;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
