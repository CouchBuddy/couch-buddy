<template>
  <div>
    <div class="grid grid-cols-5 gap-4 p-4">
      <div
        v-for="item in library"
        :key="item.id"
        class="flex justify-center items-center cursor-pointer"
        @click="showItemDetails(item)"
      >
        <img
          v-if="item.poster"
          :src="item.poster"
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

        <div class="mt-4 text-center">
          <button
            class="px-4 py-2 bg-purple-700 rounded"
            @click="playMovie(selectedItem)"
          >
            Play
          </button>
        </div>
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

        <div class="text-gray-600">
          <small>{{ selectedItem.year }}</small>
        </div>

        <div>{{ selectedItem.plot }}</div>

        <div class="mt-4 text-gray-600">
          Cast: {{ selectedItem.actors }}
        </div>

        <div class="mt-4 text-gray-600">
          Directed by {{ selectedItem.director }} -
          {{ selectedItem.writer }}
        </div>
      </div>
    </div>

    <cast-control />
  </div>
</template>

<script>
/* global chrome, cast */
import { mapState } from 'vuex'

import client from '@/client'
import config from '@/config'
import CastControl from '@/components/CastControl'

export default {
  name: 'Home',
  components: {
    CastControl
  },
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
        this.$router.push({ name: 'watch', params: { id: movie.id } })
      }
    },
    async castMovie (movie) {
      const castSession = cast.framework.CastContext.getInstance().getCurrentSession()

      const url = `${config.serverUrl}/api/watch/${movie.id}`
      const mimeType = `video/${movie.container}`

      const mediaInfo = new chrome.cast.media.MediaInfo(url, mimeType)
      const request = new chrome.cast.media.LoadRequest(mediaInfo)

      try {
        await castSession.loadMedia(request)
      } catch (e) {
        console.error(e, url, mimeType)
      }
    }
  }
}
</script>

<style lang="scss">
body {
  background: #141414;
  color: white;
}

.details-modal {
  background: rgba(0,0,0,0.95);
  box-shadow: 10px 0 10px rgba(0,0,0,0.40);
}
</style>
