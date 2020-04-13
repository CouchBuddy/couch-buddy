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
            :disabled="movie.type === 'series' && !nextEpisode"
            class="px-4 py-2 border-2 border-white"
            @click="playMovie()"
          >
            <span
              class="mdi mr-2"
              :class="isCastConnected ? 'mdi-cast' : 'mdi-play'"
            />
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

      <x-horizontal-scroller
        v-slot="item"
        :items="group.episodes"
        :centered-item-id="nextEpisode.season === group.season ? nextEpisode.id : null"
      >
        <div
          class="relative rounded-lg overflow-hidden cursor-pointer"
          @click="playMovie(item)"
        >
          <img
            :src="`${serverUrl}/api/episodes/${item.id}/thumbnail`"
            class="w-full h-full object-cover"
          >
          <div class="absolute w-full text-center bottom-0 mb-1">
            Episode {{ item.episode }}
          </div>

          <div
            class="absolute bottom-0 h-1 bg-red-700"
            :style="{ width: `${item.watched || 0}%` }"
          />
        </div>
      </x-horizontal-scroller>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

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
    ...mapActions([ 'castMovie' ]),
    async fetchEpisodes (seriesId) {
      const response = await client.get(`/api/library/${this.movieId}/episodes`)

      this.nextEpisode = response.data.find(e => e.watched < 95)
      // Dirty workaround to pass the series poster to vuex during movie casting
      this.nextEpisode.poster = this.movie.poster

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
    playMovie (episode) {
      let toPlay

      if (episode) {
        toPlay = episode
      } else {
        toPlay = this.movie.type === 'series' ? this.nextEpisode : this.movie
      }

      if (!toPlay) { return }

      if (this.isCastConnected) {
        this.castMovie(toPlay)
      } else {
        this.$router.push({ name: 'watch', params: { id: this.getWatchId(toPlay) } })
      }
    },
    getWatchId (movie) {
      return `${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`
    }
  }
}
</script>
