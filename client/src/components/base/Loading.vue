<template>
  <div
    class="border-4 border-white rounded-full loading"
  />
</template>

<script>
export default {

}
</script>

<style>
@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading {
  border-left-color: transparent;
  animation: loading 1s infinite linear;
}
</style>
