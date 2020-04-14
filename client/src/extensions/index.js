import store from '@/store'

const extensions = [
  // import('../../../../path-to-ext')
]

class ExtensionsManager {
  async loadExtensions () {
    for (const extension of extensions) {
      const { default: init } = await extension

      init(store)
    }
  }
}

export default new ExtensionsManager()
