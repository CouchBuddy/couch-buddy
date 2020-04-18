<template>
  <div
    v-shortkey="[ 'space' ]"
    class="relative w-screen h-screen overflow-hidden"
    @mousemove="onMouseMove"
    @shortkey="togglePlay()"
  >
    <div class="video-container">
      <video
        ref="video"
        :src="source"
        crossorigin="anonymous"
        @click="togglePlay()"
        @pause="onPause"
        @play="onPlay"
        @error="onVideoError"
      >
        <track
          v-for="sub in subtitles"
          :id="`subs-${sub.id}`"
          :key="`subs-${sub.id}`"
          :label="sub.lang"
          kind="subtitles"
          :srclang="sub.lang"
          :src="`${sourceSubs}/${sub.id}`"
        >
      </video>

      <div
        v-if="error"
        class="video-error"
      >
        {{ error }}
      </div>
    </div>

    <div
      class="flex items-center video-overlay"
      :class="{ 'active': showOverlay }"
    >
      <x-btn
        icon="mdi-arrow-left"
        large
        class="mr-4"
        @click="$router.go(-1)"
      />

      <div class="flex-grow">
        <div><small>NOW PLAYING</small></div>
        <h1 class="font-bold">
          {{ movie.title }}
        </h1>

        <h2>
          <span
            v-if="movie.series"
            class="mr-2"
          >
            {{ movie.series.title }}
          </span>

          <span v-if="movie.season && movie.episode">
            S{{ movie.season }}E{{ movie.episode }}
          </span>
        </h2>
      </div>
    </div>

    <video-controls
      v-if="$refs.video"
      :video="$refs.video"
      :watch-id="watchId"
      :showing="showOverlay"
      :subtitles="subtitles"
      class="absolute bottom-0 left-0 w-full p-8 video-controls"
      :class="{ 'active': showOverlay }"
      @subtitles:set="setSubtitles"
      @subtitles:add="addSubtitles"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import client from '@/client'
import VideoControls from '@/components/VideoControls'

export default {
  name: 'Watch',
  components: {
    VideoControls
  },
  data: () => ({
    error: null,
    movie: {},
    overlayTimeout: null,
    resourcePath: null,
    resourceId: null,
    showOverlay: true,
    source: null,
    sourceSubs: null,
    subtitles: [],
    updateWatchedEvery: 0.1,
    watchId: null
  }),
  computed: {
    ...mapState([ 'serverUrl' ])
  },
  created () {
    this.watchId = this.$route.params.id
  },
  async mounted () {
    this.resourcePath = this.watchId[0] === 'e' ? 'episodes' : 'library'
    this.resourceId = this.watchId.slice(1)

    if (this.watchId[0] !== 't') {
      // get movie info
      this.movie = (await client.get(`/api/${this.resourcePath}/${this.resourceId}`)).data

      // get available subtitles
      this.subtitles = (await client.get(`/api/watch/${this.watchId}/subtitles`)).data
        .map(sub => { sub.active = false; return sub })
    }

    this.source = `${this.serverUrl}/api/watch/${this.watchId}`
    this.sourceSubs = `${this.serverUrl}/api/subtitles`
  },
  methods: {
    togglePlay () {
      this.$refs.video.paused ? this.$refs.video.play() : this.$refs.video.pause()
    },
    onMouseMove () {
      if (this.$refs.video.paused) { return }

      this.showOverlay = true
      clearTimeout(this.overlayTimeout)
      this.overlayTimeout = setTimeout(() => { this.showOverlay = false }, 5000)
    },
    onPause () {
      this.showOverlay = true
      clearTimeout(this.overlayTimeout)
    },
    onPlay () {
      this.overlayTimeout = setTimeout(() => { this.showOverlay = false }, 5000)
    },
    onVideoError () {
      this.error = this.$refs.video.error.message
    },
    setSubtitles (id) {
      for (const track of this.$refs.video.textTracks) {
        const active = parseInt(track.id.slice(5)) === id
        track.mode = active ? 'showing' : 'hidden'
        track.default = active
      }

      for (const sub of this.subtitles) {
        sub.active = sub.id === id
      }
    },
    addSubtitles (subs) {
      this.subtitles.push(subs)
      this.subtitles.sort(({ lang: a }, { lang: b }) => (a > b) ? -1 : ((b > a) ? 1 : 0))
      this.setSubtitles(subs.id)
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

  .video-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
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

.video-controls {
  transform: translate(0, 100%);
  transition: all .5s;
  background: linear-gradient(to top, black, transparent);

  &.active {
    transform: none;
  }
}
</style>
