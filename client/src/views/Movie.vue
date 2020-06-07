<template>
  <div>
    <div
      style="height: 33vh; margin: -5vh -5vw; margin-bottom: 0;"
    >
      <img
        v-if="movie.backdrop"
        class="h-full w-full object-cover"
        :src="movie.backdrop"
      >
    </div>

    <div class="flex flex-col md:flex-row md:px-24">
      <div class="w-full md:w-1/3 -mt-16">
        <img
          class="w-2/3 mx-auto"
          :src="movie.poster"
        >
      </div>

      <div class="w-full md:ml-8 md:w-2/3">
        <div class="flex mt-4 mb-8 text-center">
          <x-btn
            v-if="movie.id"
            :disabled="movie.type === 'series' && !nextEpisode"
            :icon="isCastConnected ? 'mdi-cast' : 'mdi-play'"
            bordered
            class="mr-4"
            @click="playMovie()"
          >
            {{ (movie.watched > 0 && 95 > movie.watched) ? 'Continue watching' : 'Watch' }}
            <span v-if="nextEpisode">
              S{{ nextEpisode.season }}E{{ nextEpisode.episode }}
            </span>

            <div
              class="absolute bottom-0 left-0 h-1 bg-primary"
              :style="{ width: `${movie.watched}%` }"
            />
          </x-btn>

          <template v-if="movie.downloadOptions">
            <x-btn
              v-for="download in movie.downloadOptions"
              :key="`download-${download.url}`"
              bordered
              class="mr-4"
              @click="downloadMovie(download.url)"
            >
              <i class="mdi mdi-download" />
              {{ download.quality }}
            </x-btn>
          </template>

          <x-btn
            v-if="movie.id"
            :to="{ name: 'movie-edit', params: { id: movie.id } }"
            icon="mdi-pencil"
            class="px-4 py-2"
          >
            Edit Info
          </x-btn>
        </div>

        <div class="text-4xl">
          {{ movie.title }}
        </div>

        <div class="mb-2 text-gray-600">
          {{ movie.year }} - {{ movie.genre }}
        </div>

        <div class="text-lg">
          {{ movie.plot }}
        </div>

        <div class="mt-4 text-gray-600 text-lg">
          Cast: {{ movie.actors }}
        </div>

        <div class="mt-4 text-gray-600 text-lg">
          Directed by {{ movie.director }}
        </div>
      </div>
    </div>

    <template v-if="movie.episodes">
      <div
        v-for="group in movie.episodes"
        :key="`season-${group.season}`"
      >
        <div class="mt-8 mb-4">
          SEASON {{ group.season }}
        </div>

        <x-horizontal-scroller
          v-slot="{ item, index }"
          :items="group.episodes"
          :centered-item-id="nextEpisode && (nextEpisode.season === group.season) ? nextEpisode.id : null"
        >
          <div
            class="relative overflow-hidden aspect-ratio-16/9 cursor-pointer"
            @click="playMovie(group.episodes, index)"
          >
            <img
              :src="`${serverUrl}/api/episodes/${item.id}/thumbnail`"
              class="absolute w-full h-full object-cover"
            >
            <div class="absolute bottom-0 mb-1 ml-2 px-1 text-sm bg-gray-900 opacity-75">
              E{{ item.episode }}
            </div>

            <div
              class="absolute bottom-0 h-1 bg-primary"
              :style="{ width: `${item.watched || 0}%` }"
            />
          </div>
        </x-horizontal-scroller>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import { addTorrent } from '@/client'

export default {
  name: 'Movie',
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    nextEpisode: null
  }),
  computed: {
    ...mapState([ 'isCastConnected', 'serverUrl' ])
  },
  methods: {
    ...mapActions([ 'castMovie' ]),
    playMovie (episodes, index = 0) {
      let toPlay

      if (episodes) {
        toPlay = episodes
      } else {
        toPlay = this.movie.type === 'series' ? [ this.nextEpisode ] : [ this.movie ]
      }

      if (!toPlay) { return }

      if (this.isCastConnected) {
        this.castMovie({ movies: toPlay, startIndex: index })
      } else {
        this.$router.push({ name: 'watch', params: { id: this.getWatchId(toPlay[0]) } })
      }
    },
    async downloadMovie (magnetURI) {
      try {
        await addTorrent(magnetURI)
        this.$notify('Added to downloads')
      } catch (e) {
        this.$notifyError(e.message)
      }
    },
    getWatchId (movie) {
      return `${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`
    }
  }
}
</script>
