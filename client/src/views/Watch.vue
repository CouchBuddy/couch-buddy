<template>
  <div
    @mousemove="onMouseMove"
  >
    <div class="video-container">
      <video
        controls
        :src="source"
      />
    </div>

    <div
      class="video-overlay"
      :class="{ 'active': showOverlay }"
    >
      <div><small>NOW PLAYING</small></div>
      <h1>
        {{ movie.title }}
      </h1>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Watch',
  data: () => ({
    movie: {},
    movieId: null,
    overlayTimeout: null,
    showOverlay: false,
    source: null
  }),
  async mounted () {
    this.movieId = parseInt(this.$route.params.id)

    const response = await axios.get('http://localhost:3000/library.json')
    this.movie = response.data.find(m => m.id === this.movieId)

    this.source = `http://localhost:3000/api/watch/${this.movieId}.mp4`
  },
  methods: {
    onMouseMove () {
      this.showOverlay = true
      clearTimeout(this.overlayTimeout)
      this.overlayTimeout = setTimeout(() => { this.showOverlay = false }, 5000)
    }
  }
}
</script>

<style lang="scss">
.video-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.video-container video {
  /* Make video to at least 100% wide and tall */
  min-width: 100%;
  min-height: 100%;
  max-width: 100%;
  max-height: 100%;

  /* Setting width & height to auto prevents the browser from stretching or squishing the video */
  width: auto;
  height: auto;

  /* Center the video */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}

.video-overlay {
  position: relative;
  padding: 1rem 2rem;
  transform: translate(0, -100%);
  transition: all .5s;
  background: linear-gradient(to bottom, black, transparent);

  &.active {
    transform: none;
  }

  h1 {
    margin: 0;
    text-align: left;
  }
}
</style>
