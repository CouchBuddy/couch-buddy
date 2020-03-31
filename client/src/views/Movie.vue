<template>
  <div>
    <div
      class="flex mx-24 mt-16"
    >
      <div class="w-1/3">
        <img
          class="w-full"
          :src="movie.poster"
        >
      </div>

      <div class="ml-8 w-2/3">
        <h2 class="text-4xl">
          {{ movie.title }}
        </h2>

        <div class="mb-2 text-gray-600">
          <small>{{ movie.year }}</small>
        </div>

        <div>{{ movie.plot }}</div>

        <div class="mt-4 text-gray-600">
          Cast: {{ movie.actors }}
        </div>

        <div class="mt-4 text-gray-600">
          Directed by {{ movie.director }}
        </div>

        <div class="flex justify-evenly mt-8 text-center">
          <button
            class="px-4 py-2 border-2 border-white"
            @click="playMovie(movie)"
          >
            {{ movie.type === 'series' ? 'Play Next Episode' : 'Play' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-for="(episodes, season) in episodesBySeason"
      :key="`season-${season}`"
    >
      <div class="ml-24 mt-8 mb-4">
        SEASON {{ season }}
      </div>

      <div class="horizontal-scroller">
        <div
          v-for="episode in episodes"
          :key="`episode-${episode.id}`"
          class="flex justify-center items-center text-4xl bg-gray-600 rounded-lg"
        >
          {{ episode.episode }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import client from '@/client'

export default {
  name: 'Movie',
  data: () => ({
    episodesBySeason: {},
    movie: {},
    movieId: null
  }),
  async mounted () {
    this.movieId = parseInt(this.$route.params.id)

    const response = await client.get(`/api/library/${this.movieId}`)
    this.movie = response.data

    if (this.movie.type === 'series') {
      this.fetchEpisodes(this.movie.id)
    }
  },
  methods: {
    async fetchEpisodes (seriesId) {
      const response = await client.get(`/api/episodes/${seriesId}`)
      this.episodesBySeason = response.data.reduce((r, v, i, a, k = v.season) => { (r[k] || (r[k] = [])).push(v); return r }, {})
    }
  }
}
</script>

<style lang="scss">
.horizontal-scroller {
  display: grid;
  gap: 2rem;
  grid-template-columns: 4rem;
  grid-template-rows: minmax(150px, 1fr);
  grid-auto-flow: column;
  grid-auto-columns: calc(30% - 40px * 2);
  overflow-x: scroll;
  scroll-snap-type: x proximity;

  &:before,
  &:after {
    content: '';
    width: 10px;
  }

  & > * {
    scroll-snap-align: center;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
