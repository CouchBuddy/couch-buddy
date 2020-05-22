<template>
  <component
    :is="component"
    :to="to"
    class="relative btn flex items-center justify-center disabled:text-gray-600 disabled:cursor-not-allowed"
    :class="[{
      'border-2 border-white disabled:border-gray-600': bordered,
      'rounded-full': icon && !$slots.default && !tile,
      'px-4 py-2': $slots.default
    }, size]"
    v-on="$listeners"
  >
    <i
      v-if="icon"
      class="inline-flex justify-center items-center"
      :class="`mdi ${icon} ${iconSize}`"
    />

    <span
      v-if="$slots.default"
      class="tracking-wider uppercase text-sm"
      :class="{ 'ml-2': !!icon }"
    >
      <slot />
    </span>
  </component>
</template>

<script>
export default {
  props: {
    bordered: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null,
      validator: (val) => !val || val.startsWith('mdi-')
    },
    large: {
      type: Boolean,
      default: false
    },
    tile: {
      type: Boolean,
      default: false
    },
    to: {
      type: Object,
      default: null
    },
    xLarge: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    component () {
      return this.to ? 'router-link' : 'button'
    },
    iconSize () {
      if (this.xLarge) { return 'text-5xl' }
      if (this.large) { return 'text-3xl' }
      return 'text-xl'
    },
    size () {
      if (this.$slots.default) { return }
      if (this.xLarge) { return 'w-20 h-20' }
      if (this.large) { return 'w-12 h-12' }
      return 'w-8 h-8'
    }
  }
}
</script>

<style lang="scss">
.btn,
.btn {
  transition: all 0.3s;

  &:not([disabled]):hover {
    background: rgba(255, 255, 255, 0.13);
  }

  &:not([disabled]):active {
    background: rgba(255, 255, 255, 0.18);
  }

  &:focus {
    outline: none;
  }
}
</style>
