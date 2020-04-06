<template>
  <div>
    <div
      class="grid gap-4 p-4"
      style="grid-auto-rows: minmax(200px, 1fr); grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));"
    >
      <div
        v-for="item in library"
        :key="item.id"
        class="relative flex justify-center items-center cursor-pointer bg-red-700 movie-card"
      >
        <img
          v-if="item.poster"
          :src="item.poster"
          class="w-full h-full object-cover"
        >

        <div
          v-else
        >
          {{ item.title }}
        </div>

        <div class="absolute flex flex-col justify-between items-center w-full h-full movie-card__details">
          <div class="text-xl text-center mt-8">
            {{ item.title }}
          </div>

          <button
            class="px-4 text-6xl rounded-full"
            @click="playMovie(item)"
          >
            <span class="mdi mdi-play-circle" />
          </button>

          <router-link
            tag="button"
            :to="{ name: 'movie', params: { id: item.id } }"
            class="px-4 py-2 mb-4"
          >
            <span class="mdi mdi-information" />
            More Info
          </router-link>
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
  name: 'Home',
  data: () => ({
    library: [],
    selectedItem: null
  }),
  computed: {
    ...mapState([ 'isCastConnected', 'serverUrl' ])
  },
  async mounted () {
    const response = await client.get('/api/library')

    this.library = response.data
  },
  methods: {
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
      const mimeType = `video/${movie.container}`

      const mediaInfo = new chrome.cast.media.MediaInfo(url, mimeType)
      const request = new chrome.cast.media.LoadRequest(mediaInfo)

      try {
        await castSession.loadMedia(request)
      } catch (e) {
        console.error(e, url, mimeType)
      }
    },
    getWatchId (movie) {
      return `${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`
    }
  }
}
</script>

<style lang="scss">
.movie-card {
  &__details {
    background: linear-gradient(45deg, black, transparent);
    opacity: 0;
    transform: translateY(100%);
    transition: all .3s;
  }

  &:hover .movie-card__details {
    opacity: 1;
    transform: none;
  }
}
</style>
