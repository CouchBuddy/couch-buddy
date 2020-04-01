<template>
  <div class="flex">
    <button
      class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-600"
      @click="togglePlay()"
    >
      <span
        class="mdi text-2xl"
        :class="{ 'mdi-play': isPaused, 'mdi-pause': !isPaused }"
      />
    </button>

    <div class="relative flex flex-grow items-center mx-4">
      <progress
        value="50"
        max="100"
        class="absolute w-full h-full"
      />

      <input
        type="range"
        min="0"
        max="100"
        step="0.01"
        class="relative w-full h-full"
      >
    </div>

    <button
      class="flex-shrink-0 w-10 h-10 mr-2 rounded-full hover:bg-gray-600"
      @click="toggleMute()"
    >
      <span
        class="mdi text-2xl"
        :class="{ 'mdi-volume-high': !isMuted, 'mdi-volume-mute': isMuted }"
      />
    </button>

    <button
      class="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-600"
    >
      <span class="mdi mdi-closed-caption text-2xl" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'VideoControls',
  props: {
    video: {
      type: HTMLVideoElement,
      default: () => ({})
    }
  },
  data: () => ({
    isMuted: false,
    isPaused: true
  }),
  mounted () {
    this.isMuted = this.video.muted
    this.isPaused = this.video.paused

    this.video.addEventListener('play', this.onPlayPause)
    this.video.addEventListener('pause', this.onPlayPause)
    this.video.addEventListener('volumechange', this.onVolumeChange)
  },
  beforeDestroy () {
    this.video.removeEventListener('play', this.onPlayPause)
    this.video.removeEventListener('pause', this.onPlayPause)
    this.video.removeEventListener('volumechange', this.onVolumeChange)
  },
  methods: {
    togglePlay () {
      this.video.paused ? this.video.play() : this.video.pause()
    },
    toggleMute () {
      this.video.muted = !this.video.muted
    },
    onPlayPause () {
      this.isPaused = this.video.paused
    },
    onVolumeChange () {
      this.isMuted = this.video.muted
      console.log('hell')
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
