<template>
  <div>
    <h1 class="text-4xl mb-8">
      Downloads
    </h1>

    <div class="flex items-center mb-8 bg-gray-800">
      <input
        v-model="magnetURI"
        placeholder="magnet://"
        :disabled="loading"
        class="flex-grow px-4 py-2 bg-transparent border-0"
        @keypress.enter="addTorrent"
      >

      <label class="btn w-12 h-12 cursor-pointer">
        <input
          ref="upload"
          name="torrents"
          type="file"
          accept=".torrent"
          class="absolute bg-transparent"
          style="z-index: -1; height: 1px; width: 1px;"
          @change="addTorrent"
        >

        <i
          class="text-2xl mdi mdi-file-video inline-flex justify-center items-center w-full h-full"
        />
      </label>

      <x-btn
        icon="mdi-send"
        large
        tile
        :disabled="loading || !magnetURI"
        @click="addTorrent"
      />
    </div>

    <div
      v-for="torrent in torrents"
      :key="torrent.infoHash"
      class="relative flex items-center p-4 mb-4 bg-black"
    >
      <div
        class="absolute h-full left-0 top-0 bg-red-700 opacity-25"
        :style="{ width: `${torrent.progress * 100}%` }"
      />

      <div class="relative flex-grow">
        <h2 class="text-xl font-bold">
          {{ torrent.name }}
        </h2>

        <div>
          {{ torrent.downloaded | bytes }} / {{ torrent.length || 0 | bytes }}
          <small class="ml-2 text-gray-400">{{ parseInt(torrent.progress * 100) }}%</small>
        </div>

        <div class="text-gray-400">
          Remaining {{ torrent.timeRemaining / 1000 | time(true) }} -
          <span class="mdi mdi-download-network" /> {{ torrent.downloadSpeed | bytes }}/s
          <span class="mdi mdi-upload-network" /> {{ torrent.uploadSpeed | bytes }}/s
          <span class="ml-2">{{ torrent.numPeers }} peers</span>
        </div>
      </div>

      <router-link
        :to="{ name: 'watch', params: { id: `t${torrent.infoHash}` } }"
        tag="button"
        class="relative w-16 h-16 flex-shrink-0 rounded-full"
      >
        <span
          class="mdi text-4xl"
          :class="isCastConnected ? 'mdi-cast' : 'mdi-play-circle'"
        />
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import client, { socket } from '@/client'

export default {
  name: 'Downloads',
  data: () => ({
    loading: false,
    magnetURI: null,
    intervalHandle: null,
    torrents: []
  }),
  computed: {
    ...mapState([ 'isCastConnected' ])
  },
  async mounted () {
    await this.fetchDownloads()

    // this.intervalHandle = setInterval(this.fetchDownloads, 5000)
    socket.bind('torrent:download', torrent => {
      const i = this.torrents.findIndex(t => t.infoHash === torrent.infoHash)

      if (i >= 0) {
        this.$set(this.torrents, i, torrent)
      }
    })
  },
  beforeDestroy () {
    // clearInterval(this.intervalHandle)
  },
  methods: {
    async addTorrent () {
      this.loading = true

      const data = new FormData()

      if (this.$refs.upload.files[0]) {
        data.append('torrents', this.$refs.upload.files[0])
      } else if (this.magnetURI) {
        data.append('magnetURI', this.magnetURI)
      }

      try {
        const response = await client.post('/api/downloads', data)

        this.torrents.push(response.data)
        this.magnetURI = null
      } catch (e) {
      } finally {
        this.$refs.upload.value = null
        this.loading = false
      }
    },
    async fetchDownloads () {
      this.torrents = (await client.get('/api/downloads')).data
    }
  }
}
</script>

<style>

</style>
