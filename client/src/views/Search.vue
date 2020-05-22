<template>
  <div>
    <x-input
      v-model="query"
      placeholder="Search..."
      autofocus
      prefix-icon="mdi-magnify"
      @input="search()"
    />

    <div
      class="grid gap-4"
      style="grid-auto-rows: minmax(200px, 1fr); grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));"
    >
      <router-link
        v-for="item in results"
        :key="item.id"
        :to="{ name: 'movie', params: { id: item.id } }"
        class="flex justify-center items-center cursor-pointer bg-primary"
      >
        <img
          v-if="item.poster"
          :src="item.poster"
          class="w-full h-full object-cover"
        >

        <div
          v-else
        >
          {{ item.title }}
        </div>
      </router-link>
    </div>

    <div
      v-if="noResults && !loading"
      class="text-2xl text-center text-gray-600"
    >
      Sorry, no results found
    </div>
  </div>
</template>

<script>
import debounce from 'debounce'

import client from '@/client'

export default {
  name: 'Search',
  data: () => ({
    loading: false,
    noResults: false,
    query: null,
    results: []
  }),
  methods: {
    search: debounce(async function () {
      if (!this.query) { return }

      try {
        this.loading = true
        this.results = (await client.get('/api/search', {
          params: { search: this.query }
        })).data
      } catch (e) {
        this.results = []
      } finally {
        this.noResults = this.results.length === 0
        this.loading = false
      }
    }, 350)
  }
}
</script>

<style>

</style>
