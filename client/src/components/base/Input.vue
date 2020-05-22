<template>
  <div class="items-center mb-8">
    <div
      class="flex pr-4 bg-gray-800 shadow-lg"
      :class="{ 'pl-4': !prefixIcon }"
    >
      <i
        v-if="prefixIcon"
        class="py-2 w-12 text-center mdi"
        :class="prefixIcon"
      />

      <input
        ref="input"
        class="flex-grow py-2 bg-transparent border-0"
        v-bind="$attrs"
        :value="value"
        v-on="inputListeners"
      >
    </div>

    <div class="px-4 pt-1 text-sm text-error">
      {{ errors[0] }}
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    autofocus: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Array,
      default: () => []
    },
    prefixIcon: {
      type: String,
      default: null,
      validator: (val) => val.startsWith('mdi-')
    },
    value: {
      type: [ String, Number ],
      default: null
    }
  },
  data () {
    return {
    }
  },
  computed: {
    // From Vue docs:
    //   https://vuejs.org/v2/guide/components-custom-events.html#Binding-Native-Events-to-Components
    inputListeners: function () {
      var vm = this
      // `Object.assign` merges objects together to form a new object
      return Object.assign({},
        // We add all the listeners from the parent
        this.$listeners,
        // Then we can add custom listeners or override the
        // behavior of some listeners.
        {
          // This ensures that the component works with v-model
          input: function (event) {
            vm.$emit('input', event.target.value)
          }
        }
      )
    }
  },
  mounted () {
    if (this.autofocus) {
      this.$refs.input.focus()
    }
  }
}
</script>
