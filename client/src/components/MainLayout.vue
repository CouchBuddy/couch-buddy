<template>
  <div>
    <main-navigation />

    <router-view
      class="mb-16 md:ml-16"
      style="padding: 5vh 5vw"
    />

    <cast-control />
  </div>
</template>

<script>
import MainNavigation from './MainNavigation'
import CastControl from '@/components/CastControl'

export default {
  name: 'MainLayout',
  components: {
    CastControl,
    MainNavigation
  }
}
</script>

<style>

</style>
