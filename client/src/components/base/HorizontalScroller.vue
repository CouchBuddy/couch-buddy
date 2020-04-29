<template>
  <div class="relative">
    <div
      class="horizontal-scroller"
    >
      <div
        ref="scroller"
        class="horizontal-scroller__container"
        :style="{ transform: `translateX(${currentScroll}px)` }"
      >
        <div
          v-for="item in items"
          :key="`hs-${item.id}`"
          class="w-1/3 md:1/4 lg:w-1/5 xl:w-1/6 px-1 horizontal-scroller__item"
        >
          <slot
            v-bind="item"
            @click.stop
          />
        </div>
      </div>

      <button
        v-if="items.length"
        class="absolute hidden flex flex-col h-full top-0 left-0 justify-center text-5xl btn horizontal-scroller__handler"
        @click="scrollBy(1)"
      >
        <span class="mdi mdi-chevron-left" />
      </button>

      <button
        v-if="items.length"
        class="absolute hidden flex-col h-full top-0 right-0 justify-center text-5xl btn horizontal-scroller__handler"
        @click="scrollBy(-1)"
      >
        <span class="mdi mdi-chevron-right" />
      </button>
    </div>
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
    currentScroll: 0,
    maxScroll: Infinity,
    scrollDistance: 0
  }),
  mounted () {
    this.setupScrolling()

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
    setupScrolling () {
      if (!this.scrollDistance && this.$refs.scroller.firstElementChild) {
        this.scrollDistance = this.$refs.scroller.firstElementChild.offsetWidth
        this.maxScroll = this.$refs.scroller.offsetWidth -
          this.$refs.scroller.firstElementChild.offsetWidth * this.$refs.scroller.childElementCount
      }
    },
    /**
     * Scroll by the width of 1 child
     */
    scrollBy (direction = 0) {
      this.setupScrolling()

      const shouldScrollTo = this.currentScroll + this.scrollDistance * direction

      if (shouldScrollTo > 0 || shouldScrollTo < this.maxScroll) {
        return
      }

      this.currentScroll += this.scrollDistance * direction
    }
  }
}
</script>

<style lang="scss">
.horizontal-scroller {
  position: relative;
  margin: 0px -5vw;
  white-space: nowrap;
  padding: 0 5vw;
  font-size: 0;

  &:hover .horizontal-scroller__handler {
    display: flex;
  }

  .horizontal-scroller__container {
    transition: all .3s;
  }

  &__item {
    position: relative;
    display: inline-block;

    &:last-child {
      margin-right: 0;
    }

    &:focus,
    &:hover {
      transform: scale(1.2);
      z-index: 1;
    }

    transition: all .3s;
  }

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
