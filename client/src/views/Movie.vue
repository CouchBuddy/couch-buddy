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
            :disabled="!nextEpisode"
            class="px-4 py-2 border-2 border-white"
            @click="playMovie(nextEpisode)"
          >
            <span class="mdi mdi-play mr-2" />
            Watch
            <span v-if="nextEpisode">
              S{{ nextEpisode.season }}E{{ nextEpisode.episode }}
            </span>
          </button>

          <router-link
            tag="button"
            :to="{ name: 'movie-edit', params: { id: $route.params.id } }"
            class="px-4 py-2"
          >
            <span class="mdi mdi-pencil mr-2" />
            Edit Info
          </router-link>
        </div>
      </div>
    </div>

    <div
      v-for="group in episodesBySeason"
      :key="`season-${group.season}`"
    >
      <div class="mt-8 mb-4">
        SEASON {{ group.season }}
      </div>

      <div
        :id="`s${group.season}`"
        class="relative horizontal-scroller"
      >
        <div
          v-for="episode in group.episodes"
          :id="`s${group.season}e${episode.episode}`"
          :key="`episode-${episode.id}`"
          class="relative rounded-lg overflow-hidden cursor-pointer"
          @click="playMovie(episode)"
        >
          <img
            :src="`${serverUrl}/api/episodes/${episode.id}/thumbnail`"
            class="w-full h-full object-cover"
          >
          <div class="absolute w-full text-center bottom-0 mb-1">
            Episode {{ episode.episode }}
          </div>

          <div
            class="absolute bottom-0 h-1 bg-red-700"
            :style="{ width: `${episode.watched || 0}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global chrome, cast */
import { mapState } from 'vuex'

import client from '@/client'

export default {
  name: 'Movie',
  data: () => ({
    episodesBySeason: {},
    movie: {},
    movieId: null,
    nextEpisode: null
  }),
  computed: {
    ...mapState([ 'isCastConnected', 'serverUrl' ])
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

      this.nextEpisode = response.data.find(e => e.watched < 95)

      // Group episodes by season as object:
      //   { '1': [ {}, ... ] }
      const groupedEpisodes = response.data.reduce((r, v, i, a, k = v.season) => { (r[k] || (r[k] = [])).push(v); return r }, {})

      // Convert the object to array and sort both seasons and episodes:
      //   [ { season: 1, episodes: [ {}, ... ] } ]
      this.episodesBySeason = []
      for (const season in groupedEpisodes) {
        this.episodesBySeason.push({
          season: parseInt(season),
          episodes: groupedEpisodes[season].sort((a, b) => a.episode - b.episode)
        })
      }
      this.episodesBySeason.sort((a, b) => a.season - b.season)
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

      const url = `${this.serverUrl}/api/watch/${this.getWatchId(movie)}`
      // const mimeType = `video/${movie.container}`

      const mediaInfo = new chrome.cast.media.MediaInfo(url)
      const request = new chrome.cast.media.LoadRequest(mediaInfo)

      castSession.loadMedia(request, null, err => {
        console.warn('Error while casting', err)
      })
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
