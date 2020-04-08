<template>
  <div
    v-if="anyDeviceAvailable"
    class="fixed bottom-0 right-0 flex items-center mb-20 mr-4 md:m-4"
  >
    <div
      v-if="controller"
      class="flex items-center h-16 mr-4 bg-black shadow-lg"
    >
      <template v-if="mediaStatus">
        <img
          :src="mediaStatus.media.metadata.images ? mediaStatus.media.metadata.images[0].url : null"
          class="h-16 w-16 object-cover"
        >

        <div class="w-48 ml-2 text-center truncate">
          <div class="font-bold">
            {{ mediaStatus.media.metadata.title }}
          </div>

          <div
            v-if="mediaStatus.media.metadata.season && mediaStatus.media.metadata.episode"
            class="text-sm"
          >
            Season {{ mediaStatus.media.metadata.season }}
            Episode{{ mediaStatus.media.metadata.episode }}
          </div>

          <div class="h-1 mx-2 mt-1 bg-gray-900">
            <div
              class="h-full bg-red-700"
              :style="{ width: `${latestCurrentTime / mediaStatus.media.duration * 100}%` }"
            />
          </div>
        </div>
      </template>

      <button
        v-if="player.canPause"
        class="w-10 h-10 mr-3"
        @click="controller.playOrPause()"
      >
        <span
          class="mdi text-2xl"
          :class="player.isPaused ? 'mdi-play' : 'mdi-pause'"
        />
      </button>

      <button
        v-if="player.canPause"
        class="w-10 h-10 mr-3"
        @click="controller.playOrPause()"
      >
        <span class="mdi mdi-arrow-expand text-2xl" />
      </button>
    </div>

    <div class="h-12 w-12 p-3 bg-black shadow-lg rounded-full">
      <google-cast-launcher
        v-if="isCastLoaded"
        class="cursor-pointer"
      />
    </div>
  </div>
</template>

<script>
/* global cast, chrome */
import { mapMutations, mapState } from 'vuex'

import client from '@/client'

export default {
  data: () => ({
    anyDeviceAvailable: false,
    isCastLoaded: false,
    controller: null,
    latestCurrentTime: 0,
    mediaStatus: null,
    player: null
  }),
  computed: {
    ...mapState([ 'castingMovie' ])
  },
  created () {
    if (window.cast) {
      this.isCastLoaded = !!cast.framework
    }

    window.__onGCastApiAvailable = this.initCast
  },
  mounted () {
    if (this.isCastLoaded) {
      this.initCast(true)
    }
  },
  methods: {
    ...mapMutations([ 'setCastConnected' ]),
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

      this.controller.addEventListener(
        cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,
        this.onRemotePlayerChange
      )

      this.controller.addEventListener(
        cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
        this.onRemotePlayerChange
      )
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
    },
    async onRemotePlayerChange (event) {
      let tmp

      switch (event.type) {
        case cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED:
          tmp = cast.framework.CastContext
            .getInstance()
            .getCurrentSession()

          if (tmp) {
            this.mediaStatus = tmp.getMediaSession()
          }
          break

        case cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED:
          if (event.value > this.latestCurrentTime + 10) {
            this.latestCurrentTime = event.value

            const resourcePath = this.castingMovie.type === 'movie' ? 'library' : 'episodes'

            await client.patch(`/api/${resourcePath}/${this.castingMovie.id}`, {
              watched: (this.latestCurrentTime / this.mediaStatus.media.duration) * 100
            })
          }
          break
      }
    }
  }
}
</script>

<style>

</style>
