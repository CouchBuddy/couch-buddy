<template>
  <div class="grid">
    <router-link
      v-for="item in library"
      :key="item.id"
      :to="{ name: 'watch', params: { id: item.id } }"
      class="grid__item"
    >
      <img
        v-if="item.poster"
        :src="item.poster"
      >

      <div
        v-else
      >
        {{ item.title }}
      </div>
    </router-link>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  data: () => ({
    library: []
  }),
  async mounted () {
    const response = await axios.get('http://localhost:3000/api/library')

    this.library = response.data
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  background: #141414;
  color: white;
}

img {
  max-width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.grid__item {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
