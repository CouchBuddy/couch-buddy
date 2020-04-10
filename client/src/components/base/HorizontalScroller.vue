<template>
  <div class="relative horizontal-scroller">
    <slot
      v-for="item in items"
      v-bind="item"
      @click.stop
    />
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss">
.horizontal-scroller {
  display: grid;
  gap: 2rem;
  grid-template-columns: 4rem;
  grid-template-rows: minmax(150px, 1fr);
  grid-auto-flow: column;
  grid-auto-columns: calc(30% - 40px * 2);
  overflow-x: scroll;
  scroll-snap-type: x proximity;
  margin: 0px -5vw;

  &:before,
  &:after {
    content: '';
    width: 10px;
  }

  & > * {
    scroll-snap-align: center;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
