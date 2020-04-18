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
        <div
          class="relative overflow-hidden aspect-ratio-2/3 movie-card"
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
            class="absolute bottom-0 h-1 bg-primary"
            :style="{ width: `${item.watched || 0}%` }"
          />

          <div class="absolute flex flex-col justify-between items-center w-full h-full p-4 movie-card__details">
            <div />

            <x-btn
              v-if="item.type === 'movie' || item.episode"
              :icon="isCastConnected ? 'mdi-cast' : 'mdi-play-circle'"
              x-large
              @click="playMovie(item)"
            />

            <x-btn
              :to="{ name: 'movie', params: { id: item.movie ? item.movie.id : item.id } }"
              icon="mdi-information"
            >
              More Info
            </x-btn>
          </div>
        </div>
      </x-horizontal-scroller>

      <x-loading
        v-if="collection.loading"
        class="w-12 h-12 mx-auto"
      />
    </section>
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
        items: [],
        loading: false
      },
      {
        name: 'Recently Added',
        url: '/recently-added',
        items: [],
        loading: false
      }
    ],
    selectedItem: null
  }),
  computed: {
    ...mapState([ 'isCastConnected', 'serverUrl' ])
  },
  async mounted () {
    for (const collection of this.collections) {
      collection.loading = true

      client.get(`/api/collections${collection.url}`)
        .then(response => {
          collection.items = response.data
        })
        .finally(() => {
          collection.loading = false
        })
    }
  },
  methods: {
    ...mapActions([ 'castMovie' ]),
    playMovie (movie) {
      if (movie.type !== 'movie' && !movie.episode) { return }

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
