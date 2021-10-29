<template>
  <div>
    <x-modal>
      <template #activator="{ on }">
        <x-btn
          icon="mdi-plus"
          large
          v-on="on"
        >
          Add Library
        </x-btn>
      </template>

      <div class="p-4 rounded bg-black shadow-lg">
        <h2 class="text-2xl pb-2">
          Add library
        </h2>

        <x-input
          v-model="name"
          placeholder="Name"
        />

        <x-input
          v-model="path"
          placeholder="/my-folder/with-videos/"
        />

        <h3 class="text-xl pb-2">
          Network Devices
        </h3>

        <div
          v-for="device in Object.values(networkDevices)"
          :key="device.id"
          class="hover:bg-gray-900 cursor-pointer px-4 py-2"
          @click="path = device.location"
        >
          <div>{{ device.name }}</div>
          <div class="text-sm text-gray-500">
            {{ getURLHostname(device.baseURL) }}
          </div>
        </div>

        <x-btn
          color="success"
          class="mt-4"
          @click="save"
        >
          Save
        </x-btn>
      </div>
    </x-modal>
  </div>
</template>

<script>
import client, { getSocket } from '@/client'

export default {
  data: () => ({
    name: '',
    path: '',
    networkDevices: {}
  }),
  mounted () {
    this.socket = getSocket('/ssdp')

    this.socket.on('devices:new', (device) => {
      this.networkDevices[device.id] = device
    })

    this.socket.on('devices:all', (devices) => {
      this.networkDevices = devices
    })
  },
  beforeDestroy () {
    this.socket.removeAllListeners('torrent:download')
  },
  methods: {
    async save () {
      await client.post('/api/libraries', { name: this.name, path: this.path })
    },
    getURLHostname (url) {
      return new URL(url).hostname
    }
  }
}
</script>

<style>

</style>
