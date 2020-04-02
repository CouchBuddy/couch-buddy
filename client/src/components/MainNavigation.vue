<template>
  <aside class="fixed w-full md:w-16 h-16 md:h-screen bottom-0 md:top-0 bg-red-700">
    <nav class="flex flex-row md:flex-col justify-evenly md:justify-start">
      <router-link
        v-for="item in menu"
        :key="`menu-${item.to}`"
        :to="{ name: item.to }"
        active-class="border-t-4 md:border-t-0 md:border-r-4"
        exact
        class="flex h-16 w-16 items-center justify-center text-4xl"
      >
        <span
          class="mdi"
          :class="item.icon"
        />
      </router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  data: () => ({
    menu: [
      { to: 'home', icon: 'mdi-sofa' },
      { to: 'settings', icon: 'mdi-cog' }
    ]
  })
}
</script>

<style>

</style>
