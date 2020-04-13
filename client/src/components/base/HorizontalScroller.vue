<template>
  <div class="relative">
    <div
      ref="scroller"
      class="horizontal-scroller"
    >
      <slot
        v-for="item in items"
        v-bind="item"
        @click.stop
      />
    </div>

    <button
      class="absolute flex flex-col h-full top-0 left-0 justify-center text-5xl"
      @click="scrollBy(-1)"
    >
      <span class="mdi mdi-chevron-left" />
    </button>

    <button
      class="absolute flex flex-col h-full top-0 right-0 justify-center hidden md:block text-5xl"
      @click="scrollBy(1)"
    >
      <span class="mdi mdi-chevron-right" />
    </button>
  </div>
</template>

<script>
export default {
  props: {
    centeredItemId: {
      type: Number,
      default: null
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    scrollDistance: 0
  }),
  mounted () {
    this.scrollDistance = this.$refs.scroller.firstElementChild.offsetWidth

    // set initial scroll position
    if (typeof this.centeredItemId === 'number' && isFinite(this.centeredItemId)) {
      const index = this.items.findIndex(i => i.id === this.centeredItemId)

      if (index) {
        this.$refs.scroller.scrollTo({
          left: this.$refs.scroller.children[index].offsetLeft - this.scrollDistance,
          behavior: 'smooth'
        })
      }
    }
  },
  methods: {
    /**
     * Scroll by the width of 1 child
     */
    scrollBy (direction = 0) {
      this.$refs.scroller.scrollBy({ left: this.scrollDistance * direction, behavior: 'smooth' })
    }
  }
}
</script>

<style lang="scss">
.horizontal-scroller {
  overflow-x: scroll;
  margin: 0px -5vw;
  white-space: nowrap;
  padding: 0 5vw;

  & > div {
    display: inline-block;
    width: 25%;
    margin-right: 1rem;

    &:last-child {
      margin-right: 0;
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
