<template>
  <div class="flex items-center mb-8 bg-gray-800">
    <input
      ref="input"
      v-model="currentValue"
      v-bind="$attrs"
      class="flex-grow px-4 py-2 bg-transparent border-0"
      @input="onInput"
    >
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [ String, Number ],
      default: null
    }
  },
  data () {
    return {
      currentValue: this.value,
      valueWhenFocus: null
    }
  },
  methods: {
    onInput (val) {
      this.$emit('input', this.currentValue)
    }
  }
}
</script>
