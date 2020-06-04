<template>
  <movie-view
    v-if="movie"
    :movie="movie"
  />
</template>

<script>
import client from '@/client'
import MovieView from '@/views/Movie'

export default {
  components: {
    MovieView
  },
  data: () => ({
    movie: null
  }),
  async mounted () {
    this.movieId = parseInt(this.$route.params.id)

    const response = await client.get(`/api/library/${this.movieId}`)
    const movie = response.data

    if (movie.type === 'series') {
      movie.episodes = await this.fetchEpisodes(movie.id)
    }

    this.movie = movie
  },
  methods: {
    async fetchEpisodes (seriesId) {
      const response = await client.get(`/api/library/${this.movieId}/episodes`)

      this.nextEpisode = response.data.find(e => e.watched < 95)

      // Group episodes by season as object:
      //   { '1': [ {}, ... ] }
      const groupedEpisodes = response.data.reduce((r, v, i, a, k = v.season) => { (r[k] || (r[k] = [])).push(v); return r }, {})

      // Convert the object to array and sort both seasons and episodes:
      //   [ { season: 1, episodes: [ {}, ... ] } ]
      const episodesBySeason = []
      for (const season in groupedEpisodes) {
        episodesBySeason.push({
          season: parseInt(season),
          episodes: groupedEpisodes[season].sort((a, b) => a.episode - b.episode)
        })
      }

      episodesBySeason.sort((a, b) => a.season - b.season)

      return episodesBySeason
    }
  }
}
</script>
