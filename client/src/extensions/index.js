import client from '@/client'
import config from '@/config'
import store from '@/store'

class ExtensionsManager {
  async loadExtensions () {
    const extensions = (await client.get('/api/extensions')).data

    for (const extension of extensions) {
      const { default: init } = await this.externalComponent(
        `${config.serverUrl}/api/extensions/${extension.id}/load/`,
        extension.name
      )
      init(store)
    }
  }

  async externalComponent (url, _name) {
    const name = _name || url.match(/\/([^/]*)\.umd/)[1]

    if (window[name]) return window[name]

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      script.addEventListener('load', () => {
        resolve(window[name])
      })

      script.addEventListener('error', () => {
        reject(new Error(`Error loading ${url}`))
      })

      script.src = url
      document.head.appendChild(script)
    })
  }
}

export default new ExtensionsManager()
