<template>
  <div>
    <section
      v-for="collection in collections"
      :key="`coll-${collection.name}`"
      class="mb-8"
    >
      <div class="mb-4 text-xl">
        {{ collection.name }}
      </div>

      <x-horizontal-scroller
        v-slot="item"
        :items="collection.items"
      >
        <router-link
          tag="div"
          :to="{ name: 'watch', params: { id: getWatchId(item) } }"
          class="relative overflow-hidden aspect-ratio-2/3 cursor-pointer"
        >
          <img
            :src="item.movie ? item.movie.poster : item.poster"
            class="absolute w-full h-full object-cover"
          >

          <small
            v-if="item.season && item.episode"
            class="absolute top-0 right-0 m-4 rounded"
            style="padding: 1px 3px; background: rgba(40,40,40,.8)"
          >
            S{{ item.season }}E{{ item.episode }}
          </small>

          <div
            class="absolute w-full text-xl text-center bottom-0 py-2"
            style="background: linear-gradient(to top, rgba(0,0,0,.7), transparent); text-shadow: 1px 1px 0 black"
          >
            <div
              v-if="item.movie"
              class="mx-1 text-sm truncate"
            >
              {{ item.movie.title }}
            </div>

            <div class="mx-1 font-bold truncate">
              {{ item.title }}
            </div>
          </div>

          <div
            class="absolute bottom-0 h-1 bg-red-700"
            :style="{ width: `${item.watched || 0}%` }"
          />
        </router-link>
      </x-horizontal-scroller>
    </section>

    <div
      v-if="library.length"
      class="grid gap-4 p-4"
      style="grid-auto-rows: minmax(200px, 1fr); grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));"
    >
      <div
        v-for="item in library"
        :key="item.id"
        class="relative flex justify-center items-center overflow-hidden cursor-pointer bg-red-700 movie-card"
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

        <div class="absolute flex flex-col justify-between items-center w-full h-full movie-card__details">
          <div class="text-xl text-center mt-8">
            {{ item.title }}
          </div>

          <x-btn
            v-if="item.type === 'movie'"
            :icon="isCastConnected ? 'mdi-cast' : 'mdi-play-circle'"
            x-large
            @click="playMovie(item)"
          />

          <x-btn
            :to="{ name: 'movie', params: { id: item.id } }"
            icon="mdi-information"
            class="mb-4"
          >
            More Info
          </x-btn>

          <div
            v-if="item.type === 'movie'"
            class="h-1 mt-2 self-start bg-red-700"
            :style="{ width: `${Math.min(item.watched || 0, 100)}%` }"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center"
    >
      <h1 class="text-4xl">
        Your library is empty!
      </h1>

      <div class="text-xl text-gray-400">
        Go to settings and scan your media directory now
      </div>

      <router-link
        tag="button"
        :to="{ name: 'settings' }"
        class="border-2 text-xl px-4 py-2 mt-16"
      >
        <span class="mdi mdi-cog mr-2" />
        Settings
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import client from '@/client'

export default {
  name: 'Home',
  data: () => ({
    continueWatching: [],
    collections: [
      {
        name: 'Continue Watching',
        url: '/continue-watching',
        items: []
      },
      {
        name: 'Recently Added',
        url: '/recently-added',
        items: []
      }
    ],
    library: [],
    selectedItem: null
  }),
  computed: {
    ...mapState([ 'isCastConnected', 'serverUrl' ])
  },
  async mounted () {
    this.library = (await client.get('/api/library')).data

    for (const collection of this.collections) {
      collection.items = (await client.get(`/api/collections${collection.url}`)).data
    }
  },
  methods: {
    ...mapActions([ 'castMovie' ]),
    playMovie (movie) {
      if (movie.type !== 'movie') { return }

      if (this.isCastConnected) {
        this.castMovie(movie)
      } else {
        this.$router.push({ name: 'watch', params: { id: this.getWatchId(movie) } })
      }
    },
    getWatchId (movie) {
      return `${movie.type === 'movie' ? 'm' : 'e'}${movie.id}`
    }
  }
}
</script>

<style lang="scss">
.movie-card {
  &__details {
    background: linear-gradient(45deg, black, transparent);
    opacity: 0;
    transform: translateY(100%);
    transition: all .3s;
  }

  &:hover .movie-card__details {
    opacity: 1;
    transform: none;
  }
}
</style>
