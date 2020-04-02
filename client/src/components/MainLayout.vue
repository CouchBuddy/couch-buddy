<template>
  <div>
    <main-navigation />

    <router-view
      class="ml-16"
      style="padding: 5vh 5vw"
    />
  </div>
</template>

<script>
import MainNavigation from './MainNavigation'

export default {
  name: 'MainLayout',
  components: {
    MainNavigation
  }
}
</script>

<style>

</style>
