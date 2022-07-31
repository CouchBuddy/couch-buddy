<template>
  <div>
    <main-navigation />

    <router-view
      class="mb-16 md:ml-16 overflow-hidden"
      style="padding: 5vh 5vw"
    />

    <cast-control />

    <shortcut-help-dialog />

    <the-notification />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import MainNavigation from './MainNavigation'
import CastControl from '@/components/CastControl'
import ShortcutHelpDialog from './ShortcutHelpDialog'
import TheNotification from './TheNotification'

export default {
  name: 'MainLayout',
  components: {
    CastControl,
    MainNavigation,
    ShortcutHelpDialog,
    TheNotification
  },
  computed: {
    ...mapState([ 'systemInfo' ])
  }
}
</script>

<style>

</style>
