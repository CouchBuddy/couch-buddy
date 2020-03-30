<template>
  <div
    class="fixed bottom-0 right-0 flex items-center h-12 p-2 m-4 bg-black shadow-lg rounded-full"
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

    <google-cast-launcher
      v-if="isCastLoaded"
      class="w-8 h-8 cursor-pointer"
    />
  </div>
</template>

<script>
/* global cast, chrome */
import { mapMutations } from 'vuex'

export default {
  data: () => ({
    isCastLoaded: !!cast.framework,
    controller: null,
    player: null
  }),
  created () {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable && !!chrome && !!cast) {
        this.isCastLoaded = true

        cast.framework.CastContext.getInstance().setOptions({
          receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          resumeSavedSession: true
        })

        cast.framework.CastContext.getInstance().addEventListener(
          cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          this.castConnectionListener
        )
      } else {
        console.warn('Cast not available on this browser')
      }
    }
  },
  mounted () {
    this.player = new cast.framework.RemotePlayer()
    this.controller = new cast.framework.RemotePlayerController(this.player)
  },
  methods: {
    ...mapMutations(['setCastConnected']),
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
    }
  }
}
</script>

<style>

</style>
