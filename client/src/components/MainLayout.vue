<template>
  <div>
    <main-navigation />

    <router-view
      class="mb-16 md:ml-16"
      style="padding: 5vh 5vw"
    />

    <cast-control />

    <div
      v-if="systemInfo.mediaDirAvailable === false"
      class="flex fixed bottom-0 left-0 mb-20 md:ml-20 md:mb-4 h-16 w-16 items-center justify-center text-4xl"
    >
      <span class="mdi mdi-folder-alert" />
    </div>

    <shortcut-help-dialog />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import MainNavigation from './MainNavigation'
import CastControl from '@/components/CastControl'
import ShortcutHelpDialog from './ShortcutHelpDialog'

export default {
  name: 'MainLayout',
  components: {
    CastControl,
    MainNavigation,
    ShortcutHelpDialog
  },
  computed: {
    ...mapState([ 'systemInfo' ])
  }
}
</script>

<style>

</style>
