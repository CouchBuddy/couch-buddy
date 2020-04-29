<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  mounted () {
    this.$store.dispatch('fetchSystemInfo')
  }
}
</script>

<style lang="scss">
@import "tailwindcss/base";

*:focus {
  outline: none;
}

html {
  font-size: 20px;
}

body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #163133;
  color: white;
}

@import "tailwindcss/components";
@import "tailwindcss/utilities";
</style>
