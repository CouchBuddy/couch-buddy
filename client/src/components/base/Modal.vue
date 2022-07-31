<template>
  <div
    tabindex="0"
    @keydown.esc="$emit('input', false)"
  >
    <slot
      name="activator"
      v-bind="{ on: { click: () => $emit('input', !value) } }"
    />

    <!-- overlay -->
    <transition
      enter-active-class="animated fadeIn faster"
      leave-active-class="animated fadeOut faster"
    >
      <div
        v-if="value"
        class="fixed z-30 flex inset-0 modal-overlay"
      />
    </transition>

    <!-- content -->
    <transition
      enter-active-class="animated fadeInDown faster"
      leave-active-class="animated fadeOutDown faster"
    >
      <div
        v-if="value"
        class="fixed z-30 flex inset-0 justify-center items-center"
        @click="$emit('input', false)"
      >
        <div
          class="max-w-full max-h-full mx-12"
          :style="{ width }"
          @click.stop
        >
          <slot v-bind="{
            close: () => $emit('input', false),
            open: () => $emit('input', true),
          }" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '500px'
    }
  },
  data () {
    return {
      // value: false
    }
  },
  methods: {
    close () {
      this.$emit('input', false)
    },
    open () {
      this.$emit('input', true)
    }
  }
}
</script>

<style lang="scss">
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
