<template>
  <aside class="w-16 fixed h-screen bg-red-700">
    <nav>
      <router-link
        v-for="item in menu"
        :key="`menu-${item.to}`"
        :to="{ name: item.to }"
        active-class="border-r-4"
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
