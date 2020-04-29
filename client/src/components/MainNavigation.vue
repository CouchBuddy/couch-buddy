<template>
  <aside
    class="fixed w-full md:w-16 h-16 md:h-screen bottom-0 z-30 md:top-0 text-center bg-primary shadow-2xl main-nav"
    :class="{ active: open }"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <transition
      enter-active-class="animated fadeInLeft faster"
      leave-active-class="animated fadeOutLeft faster"
    >
      <nav
        v-show="open"
        class="inline-flex flex-row md:flex-col h-full justify-evenly md:justify-center text-gray-500"
      >
        <router-link
          v-for="item in menu"
          :key="`menu-${item.to}`"
          v-shortkey="item.shortkey"
          :to="{ name: item.to }"
          active-class="text-white"
          exact
          class="flex items-center justify-center md:justify-start md:my-4 text-3xl hover:text-white"
          @shortkey.native="goTo(item)"
        >
          <span
            class="mdi mr-4"
            :class="item.icon"
          />

          <span>
            {{ item.name }}
          </span>
        </router-link>
      </nav>
    </transition>
  </aside>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    open: false
  }),
  computed: {
    ...mapState('navigation', [ 'menu' ])
  },
  methods: {
    goTo (item) {
      if (!this.$route.matched.some(({ name }) => name === item.to)) {
        this.$router.push({ name: item.to })
      }
    }
  }
}
</script>

<style lang="scss">
.main-nav {
  transition: all .3s;

  &.active {
    width: 33%;
  }
}
</style>
