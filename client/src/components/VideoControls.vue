<template>
  <div class="flex items-center">
    <x-btn
      :icon="isPaused ? 'mdi-play' : 'mdi-pause'"
      large
      @click="togglePlay()"
    />

    <div class="relative flex flex-grow items-center mx-4">
      <progress
        :value="currentTime"
        min="0"
        :max="duration"
        class="absolute w-full h-full"
      />

      <input
        v-model.number="seekPosition"
        type="range"
        min="0"
        :max="duration"
        step="1"
        class="relative w-full h-full"
        @change="onSeek"
      >
    </div>

    <div class="text-sm font-bold mr-2">
      {{ remainingTime | time }}
    </div>

    <x-btn
      :icon="isMuted ? 'mdi-volume-mute' : 'mdi-volume-high'"
      large
      class="mr-2"
      @click="toggleMute()"
    />

    <subtitles-dialog
      :subtitles="subtitles"
      class="mr-2"
      @set="onSubsSelect"
      @add="onSubsAdd"
    />

    <x-btn
      :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
      large
      @click="toggleFullscreen()"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import client from '@/client'
import SubtitlesDialog from './SubtitlesDialog'

export default {
  name: 'VideoControls',
  components: {
    SubtitlesDialog
  },
  props: {
    movie: {
      type: Object,
      required: true
    },
    // Tell if this control is visible, so we can avoid to update UI if it isn't
    showing: {
      type: Boolean,
      default: true
    },
    subtitles: {
      type: Array,
      default: () => []
    },
    video: {
      type: HTMLVideoElement,
      default: () => ({})
    },
    watchId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    currentTime: 0,
    currentTimeOffset: 0,
    duration: 0,
    isFullscreen: false,
    isMuted: false,
    isPaused: true,
    remainingTime: 0,
    savedCurrentTime: 0,
    seekPosition: 0
  }),
  computed: {
    ...mapState([ 'serverUrl' ])
  },
  async mounted () {
    this.resourcePath = this.watchId[0] === 'e' ? 'episodes' : 'library'
    this.resourceId = this.watchId.slice(1)

    this.isMuted = this.video.muted
    this.isPaused = this.video.paused

    this.video.addEventListener('play', this.onPlayPause)
    this.video.addEventListener('pause', this.onPlayPause)
    this.video.addEventListener('volumechange', this.onVolumeChange)
    this.video.addEventListener('timeupdate', this.onTimeUpdate)
    document.addEventListener('fullscreenchange', this.onFullscreenChange)

    // Get metadata manually, as transcoded videos have a fake duration
    const metadata = (await client.get(`/api/watch/${this.watchId}/metadata`)).data
    this.duration = metadata.streams.find(s => s.codec_type === 'video').duration
    if (!this.duration || this.duration === 'N/A') {
      this.duration = metadata.format.duration
    }

    if (this.$route.query.continue) {
      this.video.currentTime = this.duration * this.movie.watched / 100
    }

    this.updateRemainingTime()
  },
  beforeDestroy () {
    this.video.removeEventListener('play', this.onPlayPause)
    this.video.removeEventListener('pause', this.onPlayPause)
    this.video.removeEventListener('volumechange', this.onVolumeChange)
    this.video.removeEventListener('timeupdate', this.onTimeUpdate)
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
  },
  methods: {
    togglePlay () {
      this.video.paused ? this.video.play() : this.video.pause()
    },
    toggleMute () {
      this.video.muted = !this.video.muted
    },
    updateRemainingTime () {
      this.remainingTime = this.duration - this.currentTime
    },
    onSeek () {
      if (Math.abs(this.video.duration - this.duration) < 3) {
        this.video.currentTime = this.seekPosition
      } else {
        this.video.src = `${this.serverUrl}/api/watch/${this.watchId}?current_time=${this.seekPosition}`
        this.currentTimeOffset = this.seekPosition
      }
    },
    onPlayPause () {
      this.isPaused = this.video.paused
    },
    onVolumeChange () {
      this.isMuted = this.video.muted
    },
    async onTimeUpdate () {
      if (this.video.currentTime + this.currentTimeOffset > this.savedCurrentTime + 10) {
        this.savedCurrentTime = this.video.currentTime + this.currentTimeOffset

        await client.patch(`/api/${this.resourcePath}/${this.resourceId}`, {
          watched: (this.savedCurrentTime / this.duration) * 100
        })
      }

      // Update UI time only if controls are visible
      if (!this.showing) { return }

      this.currentTime = this.video.currentTime + this.currentTimeOffset
      this.seekPosition = this.currentTime
      this.updateRemainingTime()
    },
    onSubsSelect (id) {
      this.$emit('subtitles:set', id)
    },
    onSubsAdd (id) {
      this.$emit('subtitles:add', id)
    },
    async toggleFullscreen () {
      if (this.checkFullscreen()) {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if (document.mozCancelFullScreen) await document.mozCancelFullScreen()
        else if (document.webkitCancelFullScreen) await document.webkitCancelFullScreen()
        else if (document.msExitFullscreen) await document.msExitFullscreen()
      } else {
        if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen()
        else if (document.documentElement.mozRequestFullScreen) await document.documentElement.mozRequestFullScreen()
        else if (document.documentElement.webkitRequestFullScreen) await document.documentElement.webkitRequestFullScreen()
        else if (document.documentElement.msRequestFullscreen) await document.documentElement.msRequestFullscreen()
      }
    },
    checkFullscreen () {
      return !!(
        document.fullScreen ||
        document.webkitIsFullScreen ||
        document.mozFullScreen ||
        document.msFullscreenElement ||
        document.fullscreenElement
      )
    },
    onFullscreenChange () {
      this.isFullscreen = this.checkFullscreen()
    }
  }
}
</script>

<style lang="scss" scoped>
input[type=range] {
  -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: transparent; /* Otherwise white in Chrome */
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
}

input[type=range]:focus {
  outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
}

input[type=range]::-ms-track {
  width: 100%;
  cursor: pointer;

  /* Hides the slider so custom styles can be added */
  background: transparent;
  border-color: transparent;
  color: transparent;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 100px;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
}

progress {
  height: 5px;

  &::-webkit-progress-bar {
    background: #ffffff42;
  }

  &::-webkit-progress-value {
    background: white;
  }
}
</style>
