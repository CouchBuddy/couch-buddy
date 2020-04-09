<template>
  <div
    v-show="show"
    v-shortkey="{ _: [ '?' ], __: [ 'shift', '?' ], close: [ 'esc' ] }"
    class="fixed w-screen h-screen top-0 left-0 flex justify-center items-center"
    style="background: #2f2f2f7a"
    @click="show = false"
    @shortkey="({ srcKey }) => show = srcKey !== 'close'"
  >
    <div
      class="w-1/2 p-8 rounded-sm bg-black"
      @click.stop
    >
      <div class="text-2xl mb-4">
        Navigation
      </div>

      <div
        v-for="item in shortcuts"
        :key="`shortcut-${item.name}`"
        class="flex items-center my-2"
      >
        <div class="w-1/3">
          {{ item.name }}
        </div>

        <div class="w-2/3 flex items-center">
          <template
            v-for="(key, i) in item.keys"
          >
            <div
              :key="`shortcut-${item.name}-${key}`"
              class="border rounded-sm p-2"
            >
              {{ key }}
            </div>
            <div
              v-if="i !== item.keys.length - 1"
              :key="`shortcut-${item.name}-${key}-plus`"
              class="mx-2"
            >
              +
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    show: false,
    shortcuts: [
      { name: 'Home', keys: [ 'Ctrl', 'H' ] },
      { name: 'Downloads', keys: [ 'Ctrl', 'D' ] },
      { name: 'Find', keys: [ 'Ctrl', 'F' ] }
    ]
  })
}
</script>
