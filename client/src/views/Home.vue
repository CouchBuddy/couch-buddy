<template>
  <div>
    <div
      class="grid gap-4 p-4"
      style="grid-auto-rows: minmax(200px, 1fr); grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));"
    >
      <div
        v-for="item in library"
        :key="item.id"
        class="flex justify-center items-center cursor-pointer bg-red-700"
        @click="showItemDetails(item)"
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
      </div>
    </div>

    <div
      v-if="showDetailsModal"
      class="fixed top-0 left-0 flex w-2/3 h-screen details-modal"
    >
      <div class="w-1/2">
        <img
          class="w-full"
          :src="selectedItem.poster"
        >
      </div>

      <div class="mx-4 w-1/2">
        <div
          class="text-3xl text-right mr-4 cursor-pointer"
          @click="showDetailsModal = false"
        >
          &times;
        </div>

        <h2 class="text-4xl">
          {{ selectedItem.title }}
        </h2>

        <div class="mb-2 text-gray-600">
          <small>{{ selectedItem.year }}</small>
        </div>

        <div>{{ selectedItem.plot }}</div>

        <div class="mt-4 text-gray-600">
          Cast: {{ selectedItem.actors }}
        </div>

        <div class="mt-4 text-gray-600">
          Directed by {{ selectedItem.director }}
        </div>

        <div class="flex justify-evenly mt-8 text-center">
          <button
            class="px-4 py-2 border-2 border-white"
            @click="playMovie(selectedItem)"
          >
            {{ selectedItem.type === 'series' ? 'Play Next Episode' : 'Play' }}
          </button>

          <router-link
            :to="{ name: 'movie', params: { id: selectedItem.id } }"
            class="px-4 py-2 border-2 border-white"
          >
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
import config from '@/config'

export default {
  name: 'Home',
  data: () => ({
    library: [],
    selectedItem: null,
    showDetailsModal: false
  }),
  computed: {
    ...mapState(['isCastConnected'])
  },
  async mounted () {
    const response = await client.get('/api/library')

    this.library = response.data
  },
  methods: {
    showItemDetails (item) {
      this.showDetailsModal = true
      this.selectedItem = item
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
.details-modal {
  background: rgba(0,0,0,0.95);
  box-shadow: 10px 0 10px rgba(0,0,0,0.40);
}
</style>
