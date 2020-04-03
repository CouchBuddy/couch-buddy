<template>
  <div class="flex items-center">
    <button
      class="flex-shrink-0 w-10 h-10 rounded-full"
      @click="togglePlay()"
    >
      <span
        class="mdi text-2xl"
        :class="{ 'mdi-play': isPaused, 'mdi-pause': !isPaused }"
      />
    </button>

    <div class="relative flex flex-grow items-center mx-4">
      <progress
        :value="currentTime"
        min="0"
        :max="duration"
        class="absolute w-full h-full"
      />

      <input
        v-model="seekPosition"
        type="range"
        min="0"
        :max="duration"
        step="1"
        class="relative w-full h-full"
        @input="onSeek"
      >
    </div>

    <div class="text-sm font-bold mr-2">
      {{ remainingTime }}
    </div>

    <button
      class="flex-shrink-0 w-10 h-10 mr-2 rounded-full"
      @click="toggleMute()"
    >
      <span
        class="mdi text-2xl"
        :class="{ 'mdi-volume-high': !isMuted, 'mdi-volume-mute': isMuted }"
      />
    </button>

    <subtitles-dialog
      :subtitles="subtitles"
      class="mr-2"
      @set="onSubsSelect"
      @add="onSubsAdd"
    />

    <button
      class="flex-shrink-0 w-10 h-10 rounded-full"
      @click="toggleFullscreen()"
    >
      <span
        class="mdi text-2xl"
        :class="{ 'mdi-fullscreen': !isFullscreen, 'mdi-fullscreen-exit': isFullscreen }"
      />
    </button>
  </div>
</template>

<script>
import SubtitlesDialog from './SubtitlesDialog'

export default {
  name: 'VideoControls',
  components: {
    SubtitlesDialog
  },
  props: {
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
    }
  },
  data: () => ({
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
    isMuted: false,
    isPaused: true,
    remainingTime: '0:00:00',
    seekPosition: 0
  }),
  mounted () {
    this.isMuted = this.video.muted
    this.isPaused = this.video.paused

    this.video.addEventListener('play', this.onPlayPause)
    this.video.addEventListener('pause', this.onPlayPause)
    this.video.addEventListener('volumechange', this.onVolumeChange)
    this.video.addEventListener('loadedmetadata', this.onLoadedMetadata)
    this.video.addEventListener('timeupdate', this.onTimeUpdate)
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
  },
  beforeDestroy () {
    this.video.removeEventListener('play', this.onPlayPause)
    this.video.removeEventListener('pause', this.onPlayPause)
    this.video.removeEventListener('volumechange', this.onVolumeChange)
    this.video.removeEventListener('loadedmetadata', this.onLoadedMetadata)
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
      const time = this.duration - this.currentTime

      const hours = Math.floor(time / 3600)
      let minutes = Math.floor((time - (hours * 3600)) / 60)
      let seconds = Math.round(time - (hours * 3600) - (minutes * 60))

      minutes = minutes.toString().padStart(2, '0')
      seconds = seconds.toString().padStart(2, '0')

      this.remainingTime = `${hours}:${minutes}:${seconds}`
    },
    onSeek () {
      this.video.currentTime = this.seekPosition
    },
    onPlayPause () {
      this.isPaused = this.video.paused
    },
    onVolumeChange () {
      this.isMuted = this.video.muted
    },
    onLoadedMetadata () {
      this.duration = this.video.duration
      this.updateRemainingTime()
    },
    onTimeUpdate () {
      // In some browser, duration may not be available at 'loadedmetadata' event
      if (!this.duration) {
        this.duration = this.video.duration
      }

      // Update UI time only if controls are visible
      if (!this.showing) { return }

      this.currentTime = this.video.currentTime
      this.seekPosition = this.video.currentTime
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