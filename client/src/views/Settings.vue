<template>
  <div>
    <h1 class="text-4xl mb-8">
      Settings
    </h1>

    <h2 class="text-2xl mb-4">
      System Info
    </h2>

    <div v-if="systemInfo">
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

    <div class="md:flex md:items-center mb-6">
      <div class="md:w-1/3">
        <label
          class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
          for="inline-full-name"
        >
          Library
        </label>
      </div>
      <div class="md:w-2/3">
        <button
          class="bg-transparent border-2 px-4 py-2"
          :disabled="scanningLibrary"
          @click="scanLibrary()"
        >
          {{ scanningLibrary ? 'Scanning...' : 'Scan Library' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import client from '@/client'

export default {
  data: () => ({
    scanningLibrary: false
  }),
  computed: {
    ...mapState([ 'systemInfo' ])
  },
  methods: {
    async scanLibrary () {
      try {
        this.scanningLibrary = true
        await client.post('/api/library/scan')
      } finally {
        this.scanningLibrary = false
      }
    }
  }
}
</script>

<style>

</style>
