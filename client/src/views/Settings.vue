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
        Libraries
      </h2>

      <div
        v-for="lib in libraries"
        :key="lib.id"
      >
        <div class="flex">
          <div class="flex-grow">
            <div>{{ lib.name }}</div>
            <div>{{ lib.path }}</div>
          </div>

          <div>
            <x-btn
              bordered
              :disabled="scanningLibrary"
              @click="scanLibrary(lib.id)"
            >
              {{ scanningLibrary ? 'Scanning...' : 'Scan' }}
            </x-btn>
          </div>
        </div>
      </div>

      <div>
        <edit-library-dialog />
      </div>
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
import EditLibraryDialog from '@/components/EditLibraryDialog'

export default {
  components: {
    EditLibraryDialog
  },
  data: () => ({
    extensionError: null,
    extensionInstalling: false,
    extensionName: null,
    extensions: [],
    libraries: [],
    scanningLibrary: false
  }),
  computed: {
    ...mapState([ 'systemInfo' ])
  },
  async mounted () {
    this.extensions = (await client.get('/api/extensions')).data
    this.libraries = (await client.get('/api/libraries')).data
  },
  methods: {
    async scanLibrary (libraryId) {
      try {
        this.scanningLibrary = true
        await client.post(`/api/libraries/${libraryId}/scan`)
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
