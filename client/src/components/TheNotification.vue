<template>
  <transition
    enter-active-class="animated fadeInDown faster"
    leave-active-class="animated fadeOutDown faster"
  >
    <div
      v-if="show"
      class="fixed w-64 top-0 right-0 z-50 flex items-center justify-between p-2 m-8 shadow rounded"
      style="background: rgba(0,0,0,0.9)"
    >
      <span
        class="mdi text-xl ml-1 mr-2"
        :class="`${icon} ${color}`"
      />

      <div class="flex-grow">
        {{ message }}
      </div>

      <x-btn
        icon="mdi-close"
        class="flex-shrink-0"
        @click="show = false"
      />
    </div>
  </transition>
</template>

<script>
import EventBus from '@/EventBus'

export default {
  data: () => ({
    color: null,
    icon: null,
    message: null,
    show: false,
    timeout: 6000
  }),
  mounted () {
    EventBus.$on('notification', this.showNotification)
  },
  beforeDestroy () {
    EventBus.$off('notification', this.showNotification)
  },
  methods: {
    showNotification ({ message, error }) {
      this.message = message
      this.color = error ? 'text-red-600' : 'text-green-600'
      this.icon = error ? 'mdi-close-circle' : 'mdi-check-circle'
      this.show = true

      if (this.timer) { clearTimeout(this.timer) }
      this.timer = setTimeout(() => { this.show = false }, this.timeout)
    }
  }
}
</script>
