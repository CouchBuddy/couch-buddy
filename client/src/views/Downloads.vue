<template>
  <div>
    <h1 class="text-4xl mb-8">
      Downloads
    </h1>

    <div class="flex items-center mb-8 bg-gray-800">
      <input
        v-model="magnetURI"
        placeholder="magnet://"
        class="flex-grow px-4 py-2 bg-transparent border-0"
      >

      <button
        class="px-4 py-2 text-xl"
        @click="addTorrent"
      >
        <span class="mdi mdi-send" />
      </button>
    </div>

    <div
      v-for="torrent in torrents"
      :key="torrent.infoHash"
      class="flex items-center p-4 mb-4 bg-black"
    >
      <div class="flex-grow">
        <h2 class="text-xl">
          {{ torrent.name }}
        </h2>

        <div>
          {{ parseInt(torrent.progress * 100) }}% -
          {{ torrent.timeRemaining | time }} -
          <span class="mdi mdi-download-network" /> {{ torrent.downloadSpeed }} B/s
          <span class="mdi mdi-upload-network" /> {{ torrent.uploadSpeed }} B/s
        </div>
      </div>

      <router-link
        :to="{ name: 'watch', params: { id: `t${torrent.infoHash}` } }"
        tag="button"
        class="w-16 h-16 flex-shrink-0 rounded-full"
      >
        <span class="mdi mdi-play-circle text-4xl" />
      </router-link>
    </div>
  </div>
</template>

<script>
import client from '@/client'

export default {
  name: 'Downloads',
  data: () => ({
    magnetURI: 'magnet:?xt=urn:btih:c9e15763f722f23e98a29decdfae341b98d53056&dn=Cosmos+Laundromat&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fcosmos-laundromat.torrent',
    torrents: []
  }),
  mounted () {
    this.fetchDownloads()
  },
  methods: {
    async addTorrent () {
      const response = await client.post('/api/downloads', {
        magnetURI: this.magnetURI
      })

      this.torrents.push(response.data)
    },
    async fetchDownloads () {
      this.torrents = (await client.get('/api/downloads')).data
    }
  }
}
</script>

<style>

</style>
