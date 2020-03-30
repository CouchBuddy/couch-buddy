<template>
  <div>
    <div class="grid grid-cols-5 gap-4 p-4">
      <div
        v-for="item in library"
        :key="item.id"
        class="flex justify-center items-center"
        @click="playMovie(item)"
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
    library: []
  }),
  computed: {
    ...mapState(['isCastConnected'])
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
        console.error(e)
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
</style>
