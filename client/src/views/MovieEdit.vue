<template>
  <div>
    <div class="flex items-center mb-8">
      <x-btn
        icon="mdi-arrow-left"
        large
        class="mr-4"
        @click="$router.go(-1)"
      />

      <h1 class="text-4xl">
        Edit Movie
      </h1>
    </div>

    <div>Search movie info from online DB</div>

    <div class="flex mb-4">
      <input
        v-model="query"
        placeholder="2001: A Space... or tt1234"
        class="flex-grow px-4 py-2 bg-gray-800"
        @input="searchMovieInfo"
      >

      <x-btn
        class="bg-green-600"
        @click="saveMovie"
      >
        Save
      </x-btn>
    </div>

    <div class="border-t-2" />

    <div
      v-for="field in fields"
      :key="`field-${field}`"
      class="mt-4"
    >
      <label>
        <div class="capitalize">
          {{ field }}
        </div>

        <input
          v-model="movie[field]"
          type="text"
          class="px-4 py-2 bg-gray-800"
        >
      </label>
    </div>
  </div>
</template>

<script>
import debounce from 'debounce'

import client from '@/client'

export default {
  name: 'MovieEdit',
  data: () => ({
    fields: [
      'title',
      'year',
      'actors',
      'awards',
      'country',
      'director',
      'genre',
      'imdbId',
      'language',
      'plot',
      'poster',
      'rated',
      'ratingImdb',
      'ratingMetacritic',
      'ratingRottenTomatoes',
      'released',
      'runtime',
      'type',
      'writer'
    ],
    movie: {},
    query: null,
    result: null
  }),
  async mounted () {
    this.movie = (await client.get(`/api/library/${this.$route.params.id}`)).data
  },
  methods: {
    searchMovieInfo: debounce(async function () {
      if (!this.query) { return }

      const params = {}
      if (this.query.startsWith('tt')) {
        params.imdbId = this.query
      } else {
        params.title = this.query
      }

      this.movie = (await client.get('/api/library/find-info', { params })).data || {}
    }, 350),
    async saveMovie () {
      await client.patch(`/api/library/${this.$route.params.id}`, this.movie)
    }
  }
}
</script>

<style>

</style>
