<template>
  <div>
    <input
      v-model="search"
      placeholder="Search..."
      class="bg-gray-800 w-full text-3xl px-4 py-2"
    >
  </div>
</template>

<script>
export default {
  data: () => ({
    search: null
  })
}
</script>

<style>

</style>
