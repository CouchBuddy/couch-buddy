<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

*:focus {
  outline: none;
}

body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #141414;
  color: white;
}

button {
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.185);
  }

  &:focus {
    outline: none;
  }
}
</style>
