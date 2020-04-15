<template>
  <div
    tabindex="0"
    @keydown.esc="isOpen = false"
  >
    <slot
      name="activator"
      v-bind="{ on: { click: () => isOpen = !isOpen } }"
    />

    <!-- overlay -->
    <transition
      enter-active-class="animated fadeIn faster"
      leave-active-class="animated fadeOut faster"
    >
      <div
        v-if="isOpen"
        class="fixed z-30 flex inset-0 modal-overlay"
      />
    </transition>

    <!-- content -->
    <transition
      enter-active-class="animated fadeInDown faster"
      leave-active-class="animated fadeOutDown faster"
    >
      <div
        v-if="isOpen"
        class="fixed z-30 flex inset-0 justify-center items-center"
        @click="isOpen = false"
      >
        <div
          class="max-w-full max-h-full mx-12"
          :style="{ width }"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '500px'
    }
  },
  data () {
    return {
      isOpen: false
    }
  }
}
</script>

<style lang="scss">
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
