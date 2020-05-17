<template>
  <div>
    <h1 class="text-4xl mb-8">
      Settings
    </h1>

    <h2 class="text-2xl mb-4">
      System Info
    </h2>

    <div
      v-if="systemInfo"
      class="mb-8"
    >
      <progress
        v-if="systemInfo.diskSpace && systemInfo.mediaDirAvailable"
        min="0"
        max="1"
        :value="(systemInfo.diskSpace.size - systemInfo.diskSpace.free) / systemInfo.diskSpace.size"
      />
      <div
        v-else
        class="bg-red-400 py-2 px-4 mb-4 border-red-700 border-2"
      >
        <span class="mdi mdi-alert-circle text-xl text-red-700" />
        Media dir {{ systemInfo.mediaDirPath }} is not available!
      </div>

      <div>Server IPs: {{ systemInfo.ipAddresses.join(', ') }}</div>
      <div>CouchBuddy v{{ systemInfo.version }}</div>
    </div>

    <div class="mb-8">
      <h2 class="text-2xl mb-4">
        Library
      </h2>

      <x-btn
        bordered
        :disabled="scanningLibrary"
        @click="scanLibrary()"
      >
        {{ scanningLibrary ? 'Scanning...' : 'Scan Library' }}
      </x-btn>
    </div>

    <div class="mb-8">
      <h2 class="text-2xl mb-4">
        Extensions
      </h2>

      <x-input
        v-model.trim="extensionName"
        :errors="[ extensionError ]"
        placeholder="Install an extension"
        :disabled="extensionInstalling"
        @keypress.enter="installExtension"
      />

      <div
        v-for="ext in extensions"
        :key="ext.id"
      >
        {{ ext.name }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import client from '@/client'

export default {
  data: () => ({
    extensionError: null,
    extensionInstalling: false,
    extensionName: null,
    extensions: [],
    scanningLibrary: false
  }),
  computed: {
    ...mapState([ 'systemInfo' ])
  },
  async mounted () {
    this.extensions = (await client.get('/api/extensions')).data
  },
  methods: {
    async scanLibrary () {
      try {
        this.scanningLibrary = true
        await client.post('/api/library/scan')
      } finally {
        this.scanningLibrary = false
      }
    },
    async installExtension () {
      if (this.extensionInstalling) { return }

      this.extensionInstalling = true
      this.extensionError = null

      try {
        await client.post('/api/extensions', {
          name: this.extensionName
        })
      } catch (e) {
        this.extensionError = e.toString()
      } finally {
        this.extensionInstalling = false
      }
    }
  }
}
</script>

<style>

</style>
