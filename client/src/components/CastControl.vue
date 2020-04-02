<template>
  <div
    v-if="anyDeviceAvailable"
    class="fixed bottom-0 right-0 flex items-center p-4 m-4 bg-black shadow-lg rounded-full"
  >
    <div v-if="controller && player.canPause">
      <button
        class=""
        :disabled="!player.canPause"
        @click="controller.playOrPause()"
      >
        {{ player.isPaused ? 'Play' : 'Pause' }}
      </button>
    </div>

    <div class="w-6 h-6 cursor-pointer">
      <google-cast-launcher
        v-if="isCastLoaded"
      />
    </div>
  </div>
</template>

<script>
/* global cast, chrome */
import { mapMutations } from 'vuex'

export default {
  data: () => ({
    anyDeviceAvailable: false,
    isCastLoaded: false,
    controller: null,
    player: null
  }),
  created () {
    if (window.cast) {
      this.isCastLoaded = !!cast.framework
    }

    window.__onGCastApiAvailable = this.initCast
  },
  mounted () {
    this.initCast(true)
  },
  methods: {
    ...mapMutations(['setCastConnected']),
    initCast (isAvailable) {
      if (!isAvailable || !chrome || !cast) {
        console.warn('Cast is not supported on this browser')
        return
      }

      this.isCastLoaded = true

      const context = cast.framework.CastContext.getInstance()

      this.anyDeviceAvailable = context.getCastState() !== cast.framework.CastState.NO_DEVICES_AVAILABLE

      context.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        resumeSavedSession: true
      })

      context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        this.castConnectionListener
      )
      context.addEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        this.castStateListener
      )

      this.player = new cast.framework.RemotePlayer()
      this.controller = new cast.framework.RemotePlayerController(this.player)
    },
    castConnectionListener (event) {
      switch (event.sessionState) {
        case cast.framework.SessionState.SESSION_STARTED:
        case cast.framework.SessionState.SESSION_RESUMED:
          this.setCastConnected(true)
          break

        case cast.framework.SessionState.SESSION_ENDED:
          this.setCastConnected(false)
          break
      }
    },
    castStateListener (event) {
      this.anyDeviceAvailable = event.castState !== cast.framework.CastState.NO_DEVICES_AVAILABLE
    }
  }
}
</script>

<style>

</style>
