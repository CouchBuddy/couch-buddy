<template>
  <div>
    <button
      class="flex-shrink-0 w-10 h-10 rounded-full"
      @click="show = true"
    >
      <span class="mdi mdi-closed-caption text-2xl" />
    </button>

    <div
      v-if="show"
      class="fixed w-screen h-screen top-0 left-0 flex justify-center items-center modal-background"
      @click="show = false"
      @keypress.esc="show = false"
    >
      <div
        class="bg-black py-4"
        style="min-width: 350px; max-width: 90%; max-height: 90%"
        @click.stop
      >
        <h2 class="text-2xl px-4 pb-2">
          Subtitles
        </h2>

        <div
          v-for="sub in subtitles"
          :key="`sub-${sub.id}`"
          class="flex px-6 text-lg cursor-pointer list-item"
          @click="setSubtitles(sub.id)"
        >
          <div class="flex-grow">
            {{ getLangName(sub.lang) }}
          </div>

          <span
            v-if="sub.active"
            class="mdi mdi-check ml-4"
          />
        </div>

        <div class="mx-4 border-t border-white" />

        <div class="flex px-6 text-lg list-item">
          <div class="flex-grow">
            Search
          </div>

          <select
            v-model="downloadLang"
            class="p-2 bg-transparent cursor-pointer"
          >
            <option
              v-for="lang in allLanguageCodes"
              :key="`down-${lang}`"
              :value="lang"
              class="bg-black"
            >
              {{ lang }}
            </option>
          </select>

          <button
            class="flex-shrink-0 w-10 h-10 ml-2 rounded-full"
            @click="downloadSubtitles()"
          >
            <span class="mdi mdi-download text-2xl" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ISO6391 from 'iso-639-1'

import client from '@/client'

export default {
  props: {
    subtitles: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    // langs supported by OS.org
    allLanguageCodes: ['an', 'ar', 'bg', 'ca', 'cs', 'da', 'de', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gl', 'gr', 'he', 'hi', 'hr', 'hu', 'id', 'is', 'it', 'ja', 'ka', 'km', 'ko', 'mc', 'mk', 'nl', 'no', 'oc', 'pb', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sq', 'sr', 'sv', 'th', 'tl', 'tr', 'uk', 'vi', 'zh'],
    downloadLang: 'en',
    show: false
  }),
  methods: {
    async downloadSubtitles () {
      const watchId = this.$route.params.id

      try {
        const response = await client.post(`/api/subtitles/${watchId}/download`, {
          lang: this.downloadLang
        })
        this.$emit('add', response.data)
      } catch (e) {}
    },
    getLangName (lang) {
      return ISO6391.getName(lang)
    },
    setSubtitles (id) {
      this.$emit('set', id)
    }
  }
}
</script>

<style lang="scss">
.modal-background {
  background: rgba(255, 255, 255, 0.26);
}

.list-item {
  display: flex;
  align-items: center;
  min-height: 48px;
  transition: background 0.1s;

  &:hover {
    background: rgba(255, 255, 255, 0.13);
  }
  &:active {
    background: rgba(255, 255, 255, 0.18);
  }
}
</style>
