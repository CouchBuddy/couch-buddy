<template>
  <div class="p-4">
    <h1 class="text-4xl ml-16 mb-8">
      <router-link :to="{ name: 'home' }">
        &larr;
      </router-link>
      Settings
    </h1>

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
          class="rounded bg-purple-600 px-4 py-2"
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
import client from '@/client'

export default {
  data: () => ({
    scanningLibrary: false
  }),
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
