<template>
  <div>
    <div class="grid">
      <div
        v-for="item in library"
        :key="item.id"
        class="grid__item"
        @click="castMovie(item)"
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

    <div class="fixed bottom-0 right-0 w-12 h-12 p-2 m-4 bg-black shadow-lg rounded-full cursor-pointer">
      <google-cast-launcher />
    </div>
  </div>
</template>

<script>
/* global chrome, cast */
import client from '@/client'
import config from '@/config'

export default {
  name: 'Home',
  data: () => ({
    library: []
  }),
  created () {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable && !!chrome && !!cast) {
        cast.framework.CastContext.getInstance().setOptions({
          receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        })
        console.log('Cast initialized')
      } else {
        console.warn('Cast not available on this browser')
      }
    }
  },
  async mounted () {
    const response = await client.get('/api/library')

    this.library = response.data
  },
  methods: {
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
  margin: 0;
  background: #141414;
  color: white;
}

img {
  max-width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.grid__item {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
